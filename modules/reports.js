// modules/reports.js - COMPLETE REPORTS MODULE WITH ALL FEATURES
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,
    currentReport: null,
    db: null,
    farmId: null,

    async initialize() {
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
        
        // Initialize Firebase if available
        await this.initializeFirebase();
        
        this.renderModule();
        this.initialized = true;
        return true;
    },

    async initializeFirebase() {
        // Check if Firebase is available from the main app
        if (window.FarmModules?.firebase?.app) {
            this.db = window.FarmModules.firebase.db;
            this.farmId = window.FarmModules.firebase.farmId;
            console.log('✅ Firebase initialized for reports');
        } else if (window.FarmModules?.appData?.firebase) {
            this.db = window.FarmModules.appData.firebase.db;
            this.farmId = window.FarmModules.appData.firebase.farmId;
            console.log('✅ Firebase got from app data');
        } else {
            console.log('ℹ️ Firebase not available, using localStorage only');
            this.db = null;
            this.farmId = 'demo-farm';
        }
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
                    <div id="data-status" style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                        ${this.db ? '🟢 Connected to Cloud' : '🟡 Local Storage Mode'}
                    </div>
                </div>

                <!-- Quick Stats Overview -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                    <div id="quick-stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderQuickStatsLoading()}
                    </div>
                </div>

                <!-- Report Categories -->
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

            <!-- Beautiful Email Modal -->
            <div id="email-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 500px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📧 Email Report</h3>
                        <button class="popout-modal-close" id="close-email-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="email-report-form">
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Recipient Email *</label>
                                <input type="email" id="recipient-email" class="form-input" required 
                                       placeholder="recipient@example.com">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Subject</label>
                                <input type="text" id="email-subject" class="form-input" 
                                       placeholder="Farm Report - [Date]">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Message (Optional)</label>
                                <textarea id="email-message" class="form-input" rows="4" 
                                          placeholder="Add a personal message..."></textarea>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Format</label>
                                <div style="display: flex; gap: 12px; margin-top: 8px;">
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                        <input type="radio" name="email-format" value="text" checked>
                                        <span>📝 Plain Text</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                        <input type="radio" name="email-format" value="html">
                                        <span>🎨 HTML</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                        <input type="radio" name="email-format" value="pdf">
                                        <span>📄 PDF</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="cancel-email-btn">Cancel</button>
                        <button class="btn-primary" id="send-email-btn">Send Email</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.loadInitialData();
    },

    renderQuickStatsLoading() {
        return `
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Loading...</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-secondary);">--</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Loading...</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-secondary);">--</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Loading...</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-secondary);">--</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Loading...</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-secondary);">--</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Loading...</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-secondary);">--</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Loading...</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-secondary);">--</div>
            </div>
        `;
    },

    async loadInitialData() {
        try {
            const stats = await this.getFarmStats();
            this.updateQuickStats(stats);
        } catch (error) {
            console.error('Error loading initial data:', error);
            const stats = this.getFarmStatsFromLocalStorage();
            this.updateQuickStats(stats);
        }
    },

    setupEventListeners() {
        // Report generation buttons
        document.querySelector('.generate-financial-report')?.addEventListener('click', () => this.generateFinancialReport());
        document.querySelector('.generate-production-report')?.addEventListener('click', () => this.generateProductionReport());
        document.querySelector('.generate-inventory-report')?.addEventListener('click', () => this.generateInventoryReport());
        document.querySelector('.generate-sales-report')?.addEventListener('click', () => this.generateSalesReport());
        document.querySelector('.generate-health-report')?.addEventListener('click', () => this.generateHealthReport());
        document.querySelector('.generate-feed-report')?.addEventListener('click', () => this.generateFeedReport());
        document.querySelector('.generate-comprehensive-report')?.addEventListener('click', () => this.generateComprehensiveReport());
        
        // Report action buttons
        document.getElementById('print-report-btn')?.addEventListener('click', () => this.printReport());
        document.getElementById('export-report-btn')?.addEventListener('click', () => this.exportReport());
        document.getElementById('email-report-btn')?.addEventListener('click', () => this.showEmailModal());
        document.getElementById('close-report-btn')?.addEventListener('click', () => this.closeReport());
        
        // Email modal buttons
        document.getElementById('close-email-modal')?.addEventListener('click', () => this.hideEmailModal());
        document.getElementById('cancel-email-btn')?.addEventListener('click', () => this.hideEmailModal());
        document.getElementById('send-email-btn')?.addEventListener('click', () => this.sendEmailReport());
    },

    async getFarmStats() {
        if (this.db && this.farmId) {
            try {
                // Fetch from Firebase
                const [transactions, sales, inventory, production, feedRecords] = await Promise.all([
                    this.fetchFirebaseCollection('transactions'),
                    this.fetchFirebaseCollection('sales'),
                    this.fetchFirebaseCollection('inventory'),
                    this.fetchFirebaseCollection('production'),
                    this.fetchFirebaseCollection('feedRecords')
                ]);

                return this.calculateStatsFromFirebase(transactions, sales, inventory, production, feedRecords);
            } catch (error) {
                console.error('Error fetching from Firebase:', error);
                return this.getFarmStatsFromLocalStorage();
            }
        } else {
            return this.getFarmStatsFromLocalStorage();
        }
    },

    async fetchFirebaseCollection(collectionName) {
        try {
            if (!this.db || !this.farmId) return [];
            
            const snapshot = await this.db
                .collection('farms')
                .doc(this.farmId)
                .collection(collectionName)
                .get();
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            return [];
        }
    },

    calculateStatsFromFirebase(transactions, sales, inventory, production, feedRecords) {
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const lowStockItems = inventory.filter(item => 
            (item.currentStock || 0) <= (item.minStock || 0)
        ).length;
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const totalBirds = inventory.find(item => item.type === 'birds')?.currentStock || 1000;

        return {
            totalRevenue,
            netProfit,
            totalBirds,
            totalProduction,
            lowStockItems,
            totalFeedUsed
        };
    },

    getFarmStatsFromLocalStorage() {
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

    updateQuickStats(stats) {
        const container = document.getElementById('quick-stats-container');
        if (!container) return;

        container.innerHTML = `
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

    // ==================== REPORT GENERATION METHODS ====================
    async generateFinancialReport() {
        try {
            let transactions, sales;
            
            if (this.db && this.farmId) {
                [transactions, sales] = await Promise.all([
                    this.fetchFirebaseCollection('transactions'),
                    this.fetchFirebaseCollection('sales')
                ]);
            } else {
                transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
                sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
            }
            
            const incomeTransactions = transactions.filter(t => t.type === 'income');
            const expenseTransactions = transactions.filter(t => t.type === 'expense');
            
            const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const netProfit = totalIncome - totalExpenses;
            const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

            const incomeByCategory = {};
            incomeTransactions.forEach(transaction => {
                const category = transaction.category || 'uncategorized';
                incomeByCategory[category] = (incomeByCategory[category] || 0) + (transaction.amount || 0);
            });

            const expensesByCategory = {};
            expenseTransactions.forEach(transaction => {
                const category = transaction.category || 'uncategorized';
                expensesByCategory[category] = (expensesByCategory[category] || 0) + (transaction.amount || 0);
            });

            const reportContent = `
                <div class="report-section">
                    <h4>💰 Financial Overview</h4>
                    <div class="metric-row">
                        <span class="metric-label">Data Source</span>
                        <span class="metric-value">${this.db ? 'Firebase Cloud' : 'Local Storage'}</span>
                    </div>
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
                    <h4>📈 Income by Category</h4>
                    ${Object.entries(incomeByCategory).map(([category, amount]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatCategory(category)}</span>
                            <span class="metric-value income">${this.formatCurrency(amount)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="report-section">
                    <h4>📉 Expenses by Category</h4>
                    ${Object.entries(expensesByCategory).map(([category, amount]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatCategory(category)}</span>
                            <span class="metric-value expense">${this.formatCurrency(amount)}</span>
                        </div>
                    `).join('')}
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

            this.currentReport = {
                title: 'Financial Performance Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'financial'
            };
            
            this.showReport('Financial Performance Report', reportContent);
            
        } catch (error) {
            console.error('Error generating financial report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    async generateProductionReport() {
        try {
            let production, mortality;
            
            if (this.db && this.farmId) {
                [production, mortality] = await Promise.all([
                    this.fetchFirebaseCollection('production'),
                    this.fetchFirebaseCollection('mortality')
                ]);
            } else {
                production = JSON.parse(localStorage.getItem('farm-production') || '[]');
                mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
            }
            
            const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
            const totalMortality = mortality.reduce((sum, record) => sum + (record.quantity || 0), 0);
            
            const productionByProduct = {};
            production.forEach(record => {
                const product = record.product || 'unknown';
                productionByProduct[product] = (productionByProduct[product] || 0) + (record.quantity || 0);
            });

            const qualityDistribution = {};
            production.forEach(record => {
                const quality = record.quality || 'unknown';
                qualityDistribution[quality] = (qualityDistribution[quality] || 0) + 1;
            });

            const currentStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
            const mortalityRate = currentStock > 0 ? (totalMortality / currentStock) * 100 : 0;

            const reportContent = `
                <div class="report-section">
                    <h4>🚜 Production Overview</h4>
                    <div class="metric-row">
                        <span class="metric-label">Data Source</span>
                        <span class="metric-value">${this.db ? 'Firebase Cloud' : 'Local Storage'}</span>
                    </div>
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
                    <h4>📊 Production by Product</h4>
                    ${Object.entries(productionByProduct).map(([product, quantity]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatProductName(product)}</span>
                            <span class="metric-value">${quantity} units</span>
                        </div>
                    `).join('')}
                </div>

                <div class="report-section">
                    <h4>⭐ Quality Distribution</h4>
                    ${Object.entries(qualityDistribution).map(([quality, count]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatQuality(quality)}</span>
                            <span class="metric-value">${count} records</span>
                        </div>
                    `).join('')}
                </div>

                <div class="report-section">
                    <h4>📈 Production Insights</h4>
                    <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <p style="margin: 0; color: #1e40af;">
                            ${this.getProductionInsights(totalProduction, mortalityRate, qualityDistribution)}
                        </p>
                    </div>
                </div>
            `;

            this.currentReport = {
                title: 'Production Analysis Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'production'
            };
            
            this.showReport('Production Analysis Report', reportContent);
            
        } catch (error) {
            console.error('Error generating production report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    async generateInventoryReport() {
        try {
            let inventory, feedInventory;
            
            if (this.db && this.farmId) {
                [inventory, feedInventory] = await Promise.all([
                    this.fetchFirebaseCollection('inventory'),
                    this.fetchFirebaseCollection('feedInventory')
                ]);
            } else {
                inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
                feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
            }
            
            const lowStockItems = inventory.filter(item => 
                (item.currentStock || 0) <= (item.minStock || 0)
            );
            
            const totalInventoryValue = inventory.reduce((sum, item) => 
                sum + ((item.currentStock || 0) * (item.unitPrice || 0)), 0);

            const reportContent = `
                <div class="report-section">
                    <h4>📦 Inventory Overview</h4>
                    <div class="metric-row">
                        <span class="metric-label">Data Source</span>
                        <span class="metric-value">${this.db ? 'Firebase Cloud' : 'Local Storage'}</span>
                    </div>
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
                            <span class="metric-label">${item.name || 'Unnamed Item'}</span>
                            <span class="metric-value warning">
                                ${item.currentStock || 0} / ${item.minStock || 0}
                            </span>
                        </div>
                    `).join('') : '<p style="color: #22c55e;">✅ All items are sufficiently stocked</p>'}
                </div>

                <div class="report-section">
                    <h4>🌾 Feed Inventory</h4>
                    ${feedInventory.map(item => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatFeedType(item.feedType)}</span>
                            <span class="metric-value ${(item.currentStock || 0) <= (item.minStock || 0) ? 'warning' : ''}">
                                ${item.currentStock || 0} kg (min: ${item.minStock || 0}kg)
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;

            this.currentReport = {
                title: 'Inventory Analysis Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'inventory'
            };
            
            this.showReport('Inventory Analysis Report', reportContent);
            
        } catch (error) {
            console.error('Error generating inventory report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    async generateSalesReport() {
        try {
            let sales, transactions;
            
            if (this.db && this.farmId) {
                [sales, transactions] = await Promise.all([
                    this.fetchFirebaseCollection('sales'),
                    this.fetchFirebaseCollection('transactions')
                ]);
            } else {
                sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
                transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
            }
            
            const incomeTransactions = transactions.filter(t => t.type === 'income');
            const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
            const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

            const reportContent = `
                <div class="report-section">
                    <h4>📊 Sales Performance</h4>
                    <div class="metric-row">
                        <span class="metric-label">Data Source</span>
                        <span class="metric-value">${this.db ? 'Firebase Cloud' : 'Local Storage'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Sales</span>
                        <span class="metric-value income">${this.formatCurrency(totalSales)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Income</span>
                        <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Number of Sales</span>
                        <span class="metric-value">${sales.length}</span>
                    </div>
                </div>

                <div class="report-section">
                    <h4>📈 Recent Sales</h4>
                    ${sales.slice(0, 5).map(sale => `
                        <div class="metric-row">
                            <span class="metric-label">${sale.date || 'Unknown Date'} - ${sale.customer || 'Walk-in'}</span>
                            <span class="metric-value income">${this.formatCurrency(sale.totalAmount || 0)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="report-section">
                    <h4>💡 Sales Insights</h4>
                    <div style="padding: 16px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <p style="margin: 0; color: #1e40af;">
                            ${this.getSalesInsights(sales.length, totalSales)}
                        </p>
                    </div>
                </div>
            `;

            this.currentReport = {
                title: 'Sales Performance Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'sales'
            };
            
            this.showReport('Sales Performance Report', reportContent);
            
        } catch (error) {
            console.error('Error generating sales report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    async generateHealthReport() {
        try {
            let mortalityRecords;
            const birdsStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
            
            if (this.db && this.farmId) {
                mortalityRecords = await this.fetchFirebaseCollection('mortality');
            } else {
                mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
            }
            
            const totalMortality = mortalityRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
            const mortalityRate = birdsStock > 0 ? (totalMortality / birdsStock) * 100 : 0;

            const causeBreakdown = {};
            mortalityRecords.forEach(record => {
                const cause = record.cause || 'unknown';
                causeBreakdown[cause] = (causeBreakdown[cause] || 0) + (record.quantity || 0);
            });

            const reportContent = `
                <div class="report-section">
                    <h4>🐔 Flock Health Overview</h4>
                    <div class="metric-row">
                        <span class="metric-label">Data Source</span>
                        <span class="metric-value">${this.db ? 'Firebase Cloud' : 'Local Storage'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Current Bird Count</span>
                        <span class="metric-value">${birdsStock}</span>
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
                    <h4>📊 Mortality by Cause</h4>
                    ${Object.entries(causeBreakdown).map(([cause, count]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatCause(cause)}</span>
                            <span class="metric-value">${count} birds</span>
                        </div>
                    `).join('')}
                </div>

                <div class="report-section">
                    <h4>💡 Health Recommendations</h4>
                    <div style="padding: 16px; background: #fef7ed; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #92400e;">
                            ${this.getHealthRecommendations(mortalityRate, causeBreakdown)}
                        </p>
                    </div>
                </div>
            `;

            this.currentReport = {
                title: 'Flock Health Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'health'
            };
            
            this.showReport('Flock Health Report', reportContent);
            
        } catch (error) {
            console.error('Error generating health report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    async generateFeedReport() {
        try {
            let feedRecords, feedInventory;
            
            if (this.db && this.farmId) {
                [feedRecords, feedInventory] = await Promise.all([
                    this.fetchFirebaseCollection('feedRecords'),
                    this.fetchFirebaseCollection('feedInventory')
                ]);
            } else {
                feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
                feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
            }
            
            const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
            const totalFeedCost = feedRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
            
            const feedTypeBreakdown = {};
            feedRecords.forEach(record => {
                const feedType = record.feedType || 'unknown';
                feedTypeBreakdown[feedType] = (feedTypeBreakdown[feedType] || 0) + (record.quantity || 0);
            });

            const reportContent = `
                <div class="report-section">
                    <h4>🌾 Feed Consumption Summary</h4>
                    <div class="metric-row">
                        <span class="metric-label">Data Source</span>
                        <span class="metric-value">${this.db ? 'Firebase Cloud' : 'Local Storage'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Feed Used</span>
                        <span class="metric-value">${totalFeedUsed.toFixed(2)} kg</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Feed Cost</span>
                        <span class="metric-value expense">${this.formatCurrency(totalFeedCost)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Average Cost per kg</span>
                        <span class="metric-value">${this.formatCurrency(totalFeedCost / (totalFeedUsed || 1))}</span>
                    </div>
                </div>

                <div class="report-section">
                    <h4>📊 Feed Usage by Type</h4>
                    ${Object.entries(feedTypeBreakdown).map(([feedType, quantity]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatFeedType(feedType)}</span>
                            <span class="metric-value">${quantity.toFixed(2)} kg</span>
                        </div>
                    `).join('')}
                </div>

                <div class="report-section">
                    <h4>📦 Current Feed Inventory</h4>
                    ${feedInventory.map(item => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatFeedType(item.feedType)}</span>
                            <span class="metric-value ${(item.currentStock || 0) <= (item.minStock || 0) ? 'warning' : ''}">
                                ${item.currentStock || 0} kg (min: ${item.minStock || 0}kg)
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;

            this.currentReport = {
                title: 'Feed Consumption Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'feed'
            };
            
            this.showReport('Feed Consumption Report', reportContent);
            
        } catch (error) {
            console.error('Error generating feed report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    async generateComprehensiveReport() {
        try {
            const stats = await this.getFarmStats();
            
            const reportContent = `
                <div class="report-section">
                    <h2>🏆 Comprehensive Farm Report</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        <div style="padding: 20px; background: #f0f9ff; border-radius: 12px;">
                            <h4 style="color: #1e40af; margin-bottom: 10px;">Financial Health</h4>
                            <div class="metric-row">
                                <span>Revenue:</span>
                                <span class="income">${this.formatCurrency(stats.totalRevenue)}</span>
                            </div>
                            <div class="metric-row">
                                <span>Profit:</span>
                                <span class="${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                            </div>
                        </div>
                        <div style="padding: 20px; background: #f0fdf4; border-radius: 12px;">
                            <h4 style="color: #166534; margin-bottom: 10px;">Production</h4>
                            <div class="metric-row">
                                <span>Total Birds:</span>
                                <span>${stats.totalBirds}</span>
                            </div>
                            <div class="metric-row">
                                <span>Production:</span>
                                <span>${stats.totalProduction} units</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="padding: 20px; background: #fef7ed; border-radius: 12px;">
                            <h4 style="color: #92400e; margin-bottom: 10px;">Inventory</h4>
                            <div class="metric-row">
                                <span>Low Stock Items:</span>
                                <span class="${stats.lowStockItems > 0 ? 'warning' : 'profit'}">${stats.lowStockItems}</span>
                            </div>
                            <div class="metric-row">
                                <span>Feed Used:</span>
                                <span>${stats.totalFeedUsed} kg</span>
                            </div>
                        </div>
                        <div style="padding: 20px; background: #fae8ff; border-radius: 12px;">
                            <h4 style="color: #86198f; margin-bottom: 10px;">Performance</h4>
                            <div class="metric-row">
                                <span>Farm Score:</span>
                                <span style="color: #22c55e; font-weight: bold;">${this.calculateFarmScore(stats)}%</span>
                            </div>
                            <div class="metric-row">
                                <span>Status:</span>
                                <span style="color: ${this.getFarmStatusColor(stats)};">${this.getFarmStatus(stats)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="report-section" style="margin-top: 30px;">
                        <h4>📈 Overall Assessment</h4>
                        <div style="padding: 20px; background: linear-gradient(135deg, #dcfce7, #dbeafe); border-radius: 12px;">
                            <p style="margin: 0; color: #1a1a1a; line-height: 1.6;">
                                ${this.getOverallAssessment(stats)}
                            </p>
                        </div>
                    </div>
                </div>
            `;

            this.currentReport = {
                title: 'Comprehensive Farm Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'comprehensive'
            };
            
            this.showReport('Comprehensive Farm Report', reportContent);
            
        } catch (error) {
            console.error('Error generating comprehensive report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    showReport(title, content) {
        this.addReportStyles();
        
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').classList.remove('hidden');
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
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
        document.getElementById('report-output').classList.add('hidden');
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
            farmStats: this.getFarmStatsFromLocalStorage()
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

    showEmailModal() {
        if (!this.currentReport) return;
        
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            const subjectInput = document.getElementById('email-subject');
            if (subjectInput) {
                subjectInput.value = `${this.currentReport.title} - ${new Date().toLocaleDateString()}`;
            }
            
            const emailInput = document.getElementById('recipient-email');
            if (emailInput) {
                emailInput.focus();
            }
        }
    },

    hideEmailModal() {
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('email-report-form')?.reset();
        }
    },

    sendEmailReport() {
        const emailInput = document.getElementById('recipient-email');
        const subjectInput = document.getElementById('email-subject');
        const messageInput = document.getElementById('email-message');
        const formatRadios = document.querySelectorAll('input[name="email-format"]:checked');
        
        if (!emailInput?.value) {
            this.showNotification('Please enter recipient email', 'error');
            return;
        }
        
        const emailData = {
            recipient: emailInput.value,
            subject: subjectInput?.value || `${this.currentReport.title}`,
            message: messageInput?.value || '',
            format: formatRadios[0]?.value || 'text',
            report: this.currentReport,
            timestamp: new Date().toISOString(),
            sent: true
        };
        
        // Save to localStorage
        const sentEmails = JSON.parse(localStorage.getItem('farm-sent-emails') || '[]');
        sentEmails.push(emailData);
        localStorage.setItem('farm-sent-emails', JSON.stringify(sentEmails));
        
        this.showNotification(`Report sent to ${emailData.recipient}`, 'success');
        this.hideEmailModal();
    },

    showNotification(message, type = 'success') {
        // Simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
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

// Export the module
console.log('📊 Reports module loaded successfully!');
window.FarmModules = window.FarmModules || {};
window.FarmModules.reports = ReportsModule;
