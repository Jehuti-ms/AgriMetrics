// modules/reports.js - COMPLETE WITH STYLEMANAGER INTEGRATION
console.log('Loading reports module with StyleManager integration...');

const ReportsModule = {
    name: 'reports',
    id: 'reports',
    initialized: false,
    element: null,

    initialize() {
        console.log('📈 Initializing reports with StyleManager...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        if (window.StyleManager) {
            StyleManager.registerModule(this.id, this.element, this);
        }
        
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        return true;
    },

    onThemeChange(theme) {
        console.log(`Reports module: Theme changed to ${theme}`);
        this.applyThemeStyles();
    },

    onStyleUpdate(styles) {
        console.log('Reports styles updated:', styles);
        this.applyThemeStyles();
    },

    applyThemeStyles() {
        if (!this.element || !window.StyleManager) return;
        
        const theme = StyleManager.getCurrentTheme();
        const styles = StyleManager.getModuleStyles(this.id);
        
        this.element.style.backgroundColor = styles?.backgroundColor || 
            (theme === 'dark' ? '#1a1a1a' : '#f5f5f5');
        
        this.updateTextColors(theme, styles);
        this.updateCardStyles(theme, styles);
        this.updateButtonStyles(theme, styles);
    },

    updateTextColors(theme, styles) {
        const headers = this.element.querySelectorAll('.module-title, .module-subtitle, .section-title, .report-title, .output-title');
        headers.forEach(el => {
            el.style.color = styles?.textColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
        });

        const secondaryText = this.element.querySelectorAll('.stat-label, .report-description, .metric-label, .activity-date, .empty-subtitle');
        secondaryText.forEach(el => {
            const secondaryColor = theme === 'dark' ? '#a0a0a0' : '#666666';
            el.style.color = secondaryColor;
        });

        const valueText = this.element.querySelectorAll('.stat-value, .metric-value, .activity-description, .empty-title');
        valueText.forEach(el => {
            el.style.color = styles?.textColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
        });
    },

    updateCardStyles(theme, styles) {
        const cards = this.element.querySelectorAll('.glass-card, .report-type-card, .stat-card, .activity-item');
        cards.forEach(card => {
            card.style.backgroundColor = styles?.cardBackground || 
                (theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            card.style.borderColor = styles?.borderColor || 
                (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        });
    },

    updateButtonStyles(theme, styles) {
        const buttons = this.element.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.backgroundColor = styles?.buttonBackground || 
                (theme === 'dark' ? 'rgba(40, 40, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            button.style.color = styles?.buttonTextColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
            button.style.borderColor = styles?.buttonBorderColor || 
                (theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)');
        });
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                </div>

                <div class="stats-overview glass-card">
                    <h3 class="section-title">Quick Stats Overview</h3>
                    <div class="stats-grid">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <div class="reports-grid">
                    <div class="report-type-card glass-card">
                        <div class="report-icon">💰</div>
                        <div class="report-content">
                            <h3 class="report-title">Financial Reports</h3>
                            <p class="report-description">Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div class="report-type-card glass-card">
                        <div class="report-icon">🚜</div>
                        <div class="report-content">
                            <h3 class="report-title">Production Reports</h3>
                            <p class="report-description">Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div class="report-type-card glass-card">
                        <div class="report-icon">📦</div>
                        <div class="report-content">
                            <h3 class="report-title">Inventory Reports</h3>
                            <p class="report-description">Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div class="report-type-card glass-card">
                        <div class="report-icon">📊</div>
                        <div class="report-content">
                            <h3 class="report-title">Sales Reports</h3>
                            <p class="report-description">Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div class="report-type-card glass-card">
                        <div class="report-icon">🐔</div>
                        <div class="report-content">
                            <h3 class="report-title">Health Reports</h3>
                            <p class="report-description">Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div class="report-type-card glass-card">
                        <div class="report-icon">🌾</div>
                        <div class="report-content">
                            <h3 class="report-title">Feed Reports</h3>
                            <p class="report-description">Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div class="report-type-card glass-card comprehensive-report">
                        <div class="report-icon">🏆</div>
                        <div class="report-content">
                            <h3 class="report-title">Comprehensive Farm Report</h3>
                            <p class="report-description">Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <div id="report-output" class="report-output glass-card hidden">
                    <div class="output-header">
                        <h3 class="output-title" id="report-title">Report Output</h3>
                        <div class="output-actions">
                            <button class="btn-outline" id="print-report">🖨️ Print</button>
                            <button class="btn-outline" id="export-report">📥 Export</button>
                            <button class="btn-outline" id="close-report">✕ Close</button>
                        </div>
                    </div>
                    <div class="output-content">
                        <div id="report-content"></div>
                    </div>
                </div>

                <div class="recent-activity glass-card">
                    <h3 class="section-title">Recent Farm Activity</h3>
                    <div id="recent-activity-content">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>
        `;

        this.applyInitialStyles();
        if (window.StyleManager) {
            this.applyThemeStyles();
        }
    },

    applyInitialStyles() {
        const container = this.element.querySelector('.module-container');
        if (container) {
            container.style.padding = '20px';
            container.style.maxWidth = '1200px';
            container.style.margin = '0 auto';
        }

        const header = this.element.querySelector('.module-header');
        if (header) {
            header.style.marginBottom = '30px';
        }

        const title = this.element.querySelector('.module-title');
        if (title) {
            title.style.fontSize = '28px';
            title.style.fontWeight = '600';
            title.style.marginBottom = '8px';
        }

        const subtitle = this.element.querySelector('.module-subtitle');
        if (subtitle) {
            subtitle.style.fontSize = '16px';
            subtitle.style.color = '#666';
        }

        const statsOverview = this.element.querySelector('.stats-overview');
        if (statsOverview) {
            statsOverview.style.padding = '24px';
            statsOverview.style.marginBottom = '24px';
            statsOverview.style.borderRadius = '16px';
            statsOverview.style.border = '1px solid';
            statsOverview.style.backdropFilter = 'blur(20px)';
            statsOverview.style.WebkitBackdropFilter = 'blur(20px)';
        }

        const sectionTitles = this.element.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.style.fontSize = '20px';
            title.style.marginBottom = '20px';
            title.style.fontWeight = '600';
        });

        const statsGrid = this.element.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.style.display = 'grid';
            statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
            statsGrid.style.gap = '16px';
        }

        const statCards = this.element.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.textAlign = 'center';
            card.style.padding = '16px';
            card.style.borderRadius = '8px';
            card.style.border = '1px solid';
            card.style.backdropFilter = 'blur(10px)';
            card.style.WebkitBackdropFilter = 'blur(10px)';
        });

        const statLabels = this.element.querySelectorAll('.stat-label');
        statLabels.forEach(label => {
            label.style.fontSize = '14px';
            label.style.marginBottom = '8px';
        });

        const statValues = this.element.querySelectorAll('.stat-value');
        statValues.forEach(value => {
            value.style.fontSize = '20px';
            value.style.fontWeight = 'bold';
        });

        const reportsGrid = this.element.querySelector('.reports-grid');
        if (reportsGrid) {
            reportsGrid.style.display = 'grid';
            reportsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            reportsGrid.style.gap = '20px';
            reportsGrid.style.marginTop = '30px';
        }

        const reportCards = this.element.querySelectorAll('.report-type-card');
        reportCards.forEach(card => {
            card.style.padding = '24px';
            card.style.textAlign = 'center';
            card.style.borderRadius = '16px';
            card.style.border = '1px solid';
            card.style.backdropFilter = 'blur(20px)';
            card.style.WebkitBackdropFilter = 'blur(20px)';
            card.style.transition = 'transform 0.2s ease';
        });

        const comprehensiveCard = this.element.querySelector('.comprehensive-report');
        if (comprehensiveCard) {
            comprehensiveCard.style.gridColumn = '1 / -1';
        }

        const reportIcons = this.element.querySelectorAll('.report-icon');
        reportIcons.forEach(icon => {
            icon.style.fontSize = '48px';
            icon.style.marginBottom = '16px';
        });

        const reportTitles = this.element.querySelectorAll('.report-title');
        reportTitles.forEach(title => {
            title.style.fontSize = '18px';
            title.style.fontWeight = '600';
            title.style.marginBottom = '8px';
        });

        const reportDescs = this.element.querySelectorAll('.report-description');
        reportDescs.forEach(desc => {
            desc.style.fontSize = '14px';
            desc.style.marginBottom = '16px';
            desc.style.lineHeight = '1.5';
        });

        const buttons = this.element.querySelectorAll('.btn-primary');
        buttons.forEach(button => {
            button.style.width = '100%';
            button.style.padding = '12px';
            button.style.borderRadius = '8px';
            button.style.border = 'none';
            button.style.fontWeight = '600';
            button.style.cursor = 'pointer';
            button.style.transition = 'opacity 0.2s ease';
        });

        const compButton = this.element.querySelector('.comprehensive-report .btn-primary');
        if (compButton) {
            compButton.style.background = 'linear-gradient(135deg, #22c55e, #3b82f6)';
            compButton.style.color = '#ffffff';
        }

        const reportOutput = this.element.querySelector('.report-output');
        if (reportOutput) {
            reportOutput.style.marginTop = '32px';
            reportOutput.style.borderRadius = '16px';
            reportOutput.style.border = '1px solid';
            reportOutput.style.backdropFilter = 'blur(20px)';
            reportOutput.style.WebkitBackdropFilter = 'blur(20px)';
        }

        const outputHeader = this.element.querySelector('.output-header');
        if (outputHeader) {
            outputHeader.style.display = 'flex';
            outputHeader.style.justifyContent = 'space-between';
            outputHeader.style.alignItems = 'center';
            outputHeader.style.padding = '24px';
            outputHeader.style.borderBottom = '1px solid';
        }

        const outputTitle = this.element.querySelector('.output-title');
        if (outputTitle) {
            outputTitle.style.fontSize = '18px';
            outputTitle.style.fontWeight = '600';
            outputTitle.style.margin = '0';
        }

        const outputActions = this.element.querySelector('.output-actions');
        if (outputActions) {
            outputActions.style.display = 'flex';
            outputActions.style.gap = '12px';
        }

        const outlineButtons = this.element.querySelectorAll('.btn-outline');
        outlineButtons.forEach(button => {
            button.style.padding = '8px 16px';
            button.style.borderRadius = '6px';
            button.style.border = '1px solid';
            button.style.background = 'transparent';
            button.style.fontWeight = '600';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.2s ease';
        });

        const outputContent = this.element.querySelector('.output-content');
        if (outputContent) {
            outputContent.style.padding = '24px';
        }

        const recentActivity = this.element.querySelector('.recent-activity');
        if (recentActivity) {
            recentActivity.style.padding = '24px';
            recentActivity.style.marginTop = '24px';
            recentActivity.style.borderRadius = '16px';
            recentActivity.style.border = '1px solid';
            recentActivity.style.backdropFilter = 'blur(20px)';
            recentActivity.style.WebkitBackdropFilter = 'blur(20px)';
        }

        const activityList = this.element.querySelector('.activity-list');
        if (activityList) {
            activityList.style.display = 'flex';
            activityList.style.flexDirection = 'column';
            activityList.style.gap = '12px';
        }

        const activityItems = this.element.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = '12px';
            item.style.borderRadius = '8px';
            item.style.border = '1px solid';
        });

        const activityIcons = this.element.querySelectorAll('.activity-icon');
        activityIcons.forEach(icon => {
            icon.style.fontSize = '20px';
            icon.style.marginRight = '12px';
        });

        const activityDetails = this.element.querySelectorAll('.activity-details');
        activityDetails.forEach(detail => {
            detail.style.flex = '1';
        });

        const activityDescriptions = this.element.querySelectorAll('.activity-description');
        activityDescriptions.forEach(desc => {
            desc.style.fontWeight = '600';
            desc.style.fontSize = '14px';
        });

        const activityDates = this.element.querySelectorAll('.activity-date');
        activityDates.forEach(date => {
            date.style.fontSize = '14px';
        });

        const activityAmounts = this.element.querySelectorAll('.activity-amount');
        activityAmounts.forEach(amount => {
            amount.style.fontWeight = 'bold';
            amount.style.fontSize = '14px';
        });

        const emptyState = this.element.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
        }

        const emptyIcon = this.element.querySelector('.empty-icon');
        if (emptyIcon) {
            emptyIcon.style.fontSize = '48px';
            emptyIcon.style.marginBottom = '16px';
        }

        const emptyTitle = this.element.querySelector('.empty-title');
        if (emptyTitle) {
            emptyTitle.style.fontSize = '16px';
            emptyTitle.style.marginBottom = '8px';
            emptyTitle.style.fontWeight = '600';
        }

        const emptySubtitle = this.element.querySelector('.empty-subtitle');
        if (emptySubtitle) {
            emptySubtitle.style.fontSize = '14px';
        }
    },

    setupEventListeners() {
        document.querySelector('.generate-financial-report')?.addEventListener('click', () => this.generateFinancialReport());
        document.querySelector('.generate-production-report')?.addEventListener('click', () => this.generateProductionReport());
        document.querySelector('.generate-inventory-report')?.addEventListener('click', () => this.generateInventoryReport());
        document.querySelector('.generate-sales-report')?.addEventListener('click', () => this.generateSalesReport());
        document.querySelector('.generate-health-report')?.addEventListener('click', () => this.generateHealthReport());
        document.querySelector('.generate-feed-report')?.addEventListener('click', () => this.generateFeedReport());
        document.querySelector('.generate-comprehensive-report')?.addEventListener('click', () => this.generateComprehensiveReport());
        
        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());
        document.getElementById('export-report')?.addEventListener('click', () => this.exportReport());
        document.getElementById('close-report')?.addEventListener('click', () => this.closeReport());

        const reportCards = document.querySelectorAll('.report-type-card');
        reportCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });
        });

        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '0.9';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '1';
            });
        });
    },

    renderQuickStats() {
        const stats = this.getFarmStats();
        
        return `
            <div class="stat-card">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value income">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Net Profit</div>
                <div class="stat-value ${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Birds</div>
                <div class="stat-value">${stats.totalBirds}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Production</div>
                <div class="stat-value">${stats.totalProduction}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Low Stock Items</div>
                <div class="stat-value ${stats.lowStockItems > 0 ? 'warning' : 'profit'}">${stats.lowStockItems}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Feed Used</div>
                <div class="stat-value">${stats.totalFeedUsed} kg</div>
            </div>
        `;
    },

    renderRecentActivity() {
        const activities = this.getRecentActivities();

        if (activities.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No recent activity</div>
                    <div class="empty-subtitle">Start using the app to see activity here</div>
                </div>
            `;
        }

        return `
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-details">
                            <div class="activity-description">${activity.description}</div>
                            <div class="activity-date">${activity.date}</div>
                        </div>
                        ${activity.amount !== null ? `
                            <div class="activity-amount">${this.formatCurrency(activity.amount)}</div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    getFarmStats() {
        if (window.FarmModules && window.FarmModules.appData?.profile?.dashboardStats) {
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

    getRecentActivities() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]').slice(0, 3);
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]').slice(0, 3);
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]').slice(0, 3);
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]').slice(0, 3);
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]').slice(0, 3);

        const activities = [];

        transactions.forEach(transaction => {
            activities.push({
                date: transaction.date,
                description: `${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}: ${transaction.description}`,
                amount: transaction.amount,
                icon: transaction.type === 'income' ? '💰' : '💸'
            });
        });

        sales.forEach(sale => {
            activities.push({
                date: sale.date,
                description: `📦 Sale: ${sale.items?.length || 0} items`,
                amount: sale.totalAmount,
                icon: '📦'
            });
        });

        production.forEach(record => {
            activities.push({
                date: record.date,
                description: `🚜 Production: ${record.quantity} ${record.unit} of ${record.product}`,
                amount: null,
                icon: '🚜'
            });
        });

        feedRecords.forEach(record => {
            activities.push({
                date: record.date,
                description: `🌾 Feed: ${record.quantity}kg ${record.feedType}`,
                amount: record.cost,
                icon: '🌾'
            });
        });

        mortalityRecords.forEach(record => {
            activities.push({
                date: record.date,
                description: `😔 Mortality: ${record.quantity} birds (${this.formatCause(record.cause)})`,
                amount: null,
                icon: '😔'
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        return activities.slice(0, 5);
    },

    generateFinancialReport() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        const incomeByCategory = {};
        incomeTransactions.forEach(transaction => {
            incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
        });

        const expensesByCategory = {};
        expenseTransactions.forEach(transaction => {
            expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
        });

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
                <div class="insight-box ${netProfit >= 0 ? 'positive' : 'negative'}">
                    ${this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)}
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
        
        const productionByProduct = {};
        production.forEach(record => {
            productionByProduct[record.product] = (productionByProduct[record.product] || 0) + record.quantity;
        });

        const qualityDistribution = {};
        production.forEach(record => {
            qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
        });

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
                <div class="insight-box ${mortalityRate <= 5 ? 'positive' : 'negative'}">
                    ${this.getProductionInsights(totalProduction, mortalityRate, qualityDistribution)}
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
                `).join('') : '<p class="success-message">✅ All items are sufficiently stocked</p>'}
            </div>

            <div class="report-section">
                <h4>🌾 Feed Inventory</h4>
                ${feedInventory.map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatFeedType(item.feedType)}</span>
                        <span class="metric-value ${item.currentStock <= item.minStock ? 'warning' : ''}">${item.currentStock} kg (min: ${item.minStock}kg)</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.showReport('Inventory Analysis Report', reportContent);
    },

    generateSalesReport() {
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

        const reportContent = `
            <div class="report-section">
                <h4>📊 Sales Performance</h4>
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
                        <span class="metric-label">${sale.date} - ${sale.customer || 'Walk-in'}</span>
                        <span class="metric-value income">${this.formatCurrency(sale.totalAmount)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>💡 Sales Insights</h4>
                <div class="insight-box ${sales.length > 0 ? 'positive' : 'neutral'}">
                    ${this.getSalesInsights(sales.length, totalSales)}
                </div>
            </div>
        `;

        this.showReport('Sales Performance Report', reportContent);
    },

    generateHealthReport() {
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const birdsStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        
        const totalMortality = mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        const mortalityRate = birdsStock > 0 ? (totalMortality / birdsStock) * 100 : 0;

        const causeBreakdown = {};
        mortalityRecords.forEach(record => {
            causeBreakdown[record.cause] = (causeBreakdown[record.cause] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4>🐔 Flock Health Overview</h4>
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
                <div class="insight-box ${mortalityRate <= 5 ? 'positive' : 'warning'}">
                    ${this.getHealthRecommendations(mortalityRate, causeBreakdown)}
                </div>
            </div>
        `;

        this.showReport('Flock Health Report', reportContent);
    },

    generateFeedReport() {
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
        
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalFeedCost = feedRecords.reduce((sum, record) => sum + record.cost, 0);
        const avgCostPerKg = totalFeedUsed > 0 ? totalFeedCost / totalFeedUsed : 0;
        
        const feedTypeBreakdown = {};
        feedRecords.forEach(record => {
            feedTypeBreakdown[record.feedType] = (feedTypeBreakdown[record.feedType] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4>🌾 Feed Consumption Summary</h4>
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
                    <span class="metric-value">${this.formatCurrency(avgCostPerKg)}</span>
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
                        <span class="metric-value ${item.currentStock <= item.minStock ? 'warning' : ''}">${item.currentStock} kg (min: ${item.minStock}kg)</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.showReport('Feed Consumption Report', reportContent);
    },

    generateComprehensiveReport() {
        const stats = this.getFarmStats();
        const farmScore = this.calculateFarmScore(stats);
        
        const reportContent = `
            <div class="report-section">
                <h2>🏆 Comprehensive Farm Report</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h4 style="margin-bottom: 10px;">Financial Health</h4>
                        <div class="metric-row">
                            <span>Revenue:</span>
                            <span class="income">${this.formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div class="metric-row">
                            <span>Profit:</span>
                            <span class="${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                        </div>
                    </div>
                    <div style="padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h4 style="margin-bottom: 10px;">Production</h4>
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

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h4 style="margin-bottom: 10px;">Inventory</h4>
                        <div class="metric-row">
                            <span>Low Stock Items:</span>
                            <span class="${stats.lowStockItems > 0 ? 'warning' : 'profit'}">${stats.lowStockItems}</span>
                        </div>
                        <div class="metric-row">
                            <span>Feed Used:</span>
                            <span>${stats.totalFeedUsed} kg</span>
                        </div>
                    </div>
                    <div style="padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h4 style="margin-bottom: 10px;">Performance</h4>
                        <div class="metric-row">
                            <span>Farm Score:</span>
                            <span class="${farmScore >= 80 ? 'profit' : farmScore >= 60 ? 'warning' : 'expense'}">${farmScore}%</span>
                        </div>
                        <div class="metric-row">
                            <span>Status:</span>
                            <span class="${farmScore >= 80 ? 'profit' : farmScore >= 60 ? 'warning' : 'expense'}">${this.getFarmStatus(farmScore)}</span>
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h4>📈 Overall Assessment</h4>
                    <div class="insight-box ${farmScore >= 80 ? 'positive' : farmScore >= 60 ? 'neutral' : 'negative'}">
                        ${this.getComprehensiveAssessment(stats, farmScore)}
                    </div>
                </div>
            </div>
        `;

        this.showReport('Comprehensive Farm Report', reportContent);
    },

    calculateFarmScore(stats) {
        let score = 100;
        
        if (stats.netProfit < 0) score -= 30;
        else if (stats.netProfit === 0) score -= 10;
        
        if (stats.totalProduction === 0) score -= 20;
        
        if (stats.lowStockItems > 3) score -= 15;
        else if (stats.lowStockItems > 0) score -= 5;
        
        if (stats.totalBirds === 0) score -= 15;
        
        return Math.max(0, Math.min(100, score));
    },

    getFarmStatus(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    },

    getComprehensiveAssessment(stats, farmScore) {
        if (farmScore >= 80) {
            return "🎉 Excellent performance! Your farm is operating at optimal levels with strong financial results and good inventory management. Continue with current practices.";
        } else if (farmScore >= 60) {
            return "✅ Good performance overall. Some areas could be improved - focus on increasing profitability and managing inventory levels more closely.";
        } else if (farmScore >= 40) {
            return "⚠️ Fair performance. Significant improvements needed in financial management and operational efficiency. Consider reviewing expenses and production processes.";
        } else {
            return "🔴 Immediate attention required. The farm is underperforming in multiple areas. Consider consulting with agricultural experts and implementing corrective measures.";
        }
    },

    showReport(title, content) {
        const reportOutput = document.getElementById('report-output');
        if (reportOutput) {
            document.getElementById('report-title').textContent = title;
            document.getElementById('report-content').innerHTML = content;
            reportOutput.classList.remove('hidden');
            reportOutput.scrollIntoView({ behavior: 'smooth' });
        }
    },

    closeReport() {
        const reportOutput = document.getElementById('report-output');
        if (reportOutput) {
            reportOutput.classList.add('hidden');
        }
    },

    printReport() {
        const reportTitle = document.getElementById('report-title').textContent;
        const reportContent = document.getElementById('report-content').innerHTML;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .report-section { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        .metric-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; }
                        .metric-label { font-weight: 600; }
                        .metric-value { font-weight: bold; }
                        .income { color: #22c55e; }
                        .expense { color: #ef4444; }
                        .profit { color: #22c55e; }
                        .warning { color: #f59e0b; }
                        .insight-box { padding: 16px; border-radius: 8px; margin-top: 16px; }
                        .positive { background: #f0fdf4; border-left: 4px solid #22c55e; }
                        .negative { background: #fef2f2; border-left: 4px solid #ef4444; }
                        .warning-box { background: #fef7ed; border-left: 4px solid #f59e0b; }
                        .neutral { background: #eff6ff; border-left: 4px solid #3b82f6; }
                        .success-message { color: #22c55e; font-weight: 600; }
                        h1, h2, h3, h4 { color: #1a1a1a; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="margin-bottom: 20px; color: #666;">
                        Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                    </div>
                    <hr>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    },

    exportReport() {
        const reportTitle = document.getElementById('report-title').textContent;
        const reportContent = document.getElementById('report-content').textContent;
        
        const blob = new Blob([
            `REPORT: ${reportTitle}\n` +
            `Generated: ${new Date().toLocaleDateString()}\n\n` +
            `${reportContent}\n\n` +
            `--- End of Report ---`
        ], { type: 'text/plain' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.coreModule?.showNotification) {
            window.coreModule.showNotification('Report exported successfully!', 'success');
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
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
            'other': 'Other'
        };
        return categories[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    },

    formatProductName(product) {
        const products = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'poultry': 'Poultry',
            'chicken': 'Chicken',
            'other': 'Other'
        };
        return products[product] || product.charAt(0).toUpperCase() + product.slice(1);
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent',
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'grade-c': 'Grade C',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor',
            'rejects': 'Rejects'
        };
        return qualities[quality] || quality.charAt(0).toUpperCase() + quality.slice(1).replace('-', ' ');
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator',
            'accident': 'Accident',
            'heat-stress': 'Heat Stress',
            'cold-stress': 'Cold Stress',
            'starvation': 'Starvation',
            'other': 'Other'
        };
        return causes[cause] || cause.charAt(0).toUpperCase() + cause.slice(1).replace('-', ' ');
    },

    formatFeedType(feedType) {
        const types = {
            'starter': 'Starter',
            'grower': 'Grower',
            'finisher': 'Finisher',
            'layer': 'Layer',
            'broiler': 'Broiler',
            'mash': 'Mash',
            'pellets': 'Pellets',
            'other': 'Other'
        };
        return types[feedType] || feedType.charAt(0).toUpperCase() + feedType.slice(1);
    },

    getFinancialInsights(income, expenses, netProfit, profitMargin) {
        if (income === 0 && expenses === 0) {
            return "📝 No financial data recorded yet. Start by adding income and expense transactions.";
        } else if (netProfit < 0) {
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
        if (totalProduction === 0) {
            return "No production data recorded. Start tracking your farm's output to generate insights.";
        }
        
        let insights = [];
        
        if (mortalityRate > 10) {
            insights.push("⚠️ High mortality rate affecting production. Review flock management practices.");
        } else if (mortalityRate > 5) {
            insights.push("Monitor flock health closely. Review feeding, housing, and environmental conditions.");
        }
        
        if (qualityDistribution['excellent'] && qualityDistribution['excellent'] > Object.values(qualityDistribution).reduce((a, b) => a + b, 0) * 0.5) {
            insights.push("✅ Excellent quality production! Maintain current standards and practices.");
        } else if (qualityDistribution['poor'] || qualityDistribution['rejects']) {
            insights.push("Focus on improving product quality. Review production processes and quality control.");
        }
        
        if (insights.length === 0) {
            return "Good production levels. Focus on consistency and quality improvement.";
        }
        
        return insights.join(' ');
    },

    getSalesInsights(salesCount, totalSales) {
        if (salesCount === 0) {
            return "No sales recorded yet. Focus on marketing and customer acquisition strategies.";
        }
        
        if (totalSales < 1000) {
            return "Sales are starting. Consider expanding product offerings and marketing efforts.";
        } else if (totalSales > 5000) {
            return "Strong sales performance! Consider scaling operations and exploring new markets.";
        } else if (totalSales > 2000) {
            return "Steady sales growth. Continue current strategies and monitor customer feedback.";
        }
        
        return "Sales performance needs improvement. Review pricing, marketing, and customer engagement.";
    },

    getHealthRecommendations(mortalityRate, causeBreakdown) {
        if (mortalityRate > 10) {
            return "⚠️ High mortality rate detected! Immediate veterinary consultation recommended. Review biosecurity measures.";
        } else if (mortalityRate > 5) {
            return "Monitor flock health closely. Review feeding, housing, ventilation, and water quality. Consider preventive measures.";
        } else if (causeBreakdown.disease > 0) {
            return "Disease cases detected. Implement biosecurity measures, proper sanitation, and consider vaccination program.";
        } else if (causeBreakdown['heat-stress'] > 0) {
            return "Heat stress detected. Improve ventilation, provide adequate shade and cooling, ensure water availability.";
        }
        
        return "✅ Good flock health. Maintain current management practices, regular monitoring, and preventive care.";
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered with StyleManager integration');
}

window.ReportsModule = ReportsModule;
