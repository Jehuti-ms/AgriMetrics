// modules/reports.js - UPDATED WITH FIREBASE INTEGRATION
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,
    currentReport: null,
    db: null,
    farmId: null,

    async initialize() {
        console.log('📈 Initializing reports with Firebase...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        // Initialize Firebase
        await this.initializeFirebase();
        
        this.renderModule();
        this.initialized = true;
        return true;
    },

    async initializeFirebase() {
        if (window.FarmModules?.firebase?.app) {
            this.db = window.FarmModules.firebase.db;
            this.farmId = window.FarmModules.firebase.farmId;
            console.log('✅ Firebase already initialized for reports');
            return;
        }

        try {
            // Try to get Firebase from main app
            if (window.FarmModules?.appData?.firebase) {
                this.db = window.FarmModules.appData.firebase.db;
                this.farmId = window.FarmModules.appData.firebase.farmId;
                console.log('✅ Got Firebase from main app');
            } else {
                // Initialize Firebase directly
                const firebaseConfig = {
                    apiKey: "YOUR_API_KEY",
                    authDomain: "YOUR_AUTH_DOMAIN",
                    projectId: "YOUR_PROJECT_ID",
                    storageBucket: "YOUR_STORAGE_BUCKET",
                    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                    appId: "YOUR_APP_ID"
                };

                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                
                this.db = firebase.firestore();
                this.farmId = localStorage.getItem('farmId') || 'demo-farm';
                console.log('✅ Firebase initialized directly');
            }
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            // Fallback to localStorage only
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
            <!-- Previous HTML remains the same, but add loading state -->
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                    <div id="data-status" style="margin-top: 10px; font-size: 14px; color: var(--text-secondary);">
                        ${this.db ? '🟢 Connected to Cloud' : '🟡 Local Storage Mode'}
                    </div>
                </div>

                <!-- Rest of the HTML remains exactly the same -->
                ${this.getModuleHTML()}
            </div>
        `;

        this.setupEventListeners();
        this.loadInitialData();
    },

    getModuleHTML() {
        return `
            <!-- Quick Stats Overview -->
            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                <div id="quick-stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    ${this.renderQuickStatsLoading()}
                </div>
            </div>

            <!-- Report Categories Grid (same as before) -->
            <div class="reports-grid">
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

                <!-- ... all other report cards remain exactly the same ... -->

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

            <!-- Report Output Section and Email Modal remain the same -->
            ${this.getReportOutputHTML()}
            ${this.getEmailModalHTML()}
        `;
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

    async getFarmStats() {
        if (this.db && this.farmId) {
            try {
                console.log('📊 Fetching stats from Firebase...');
                
                // Get data from Firebase
                const [transactions, sales, inventory, production, feedRecords, profile] = await Promise.all([
                    this.fetchFirebaseCollection('transactions'),
                    this.fetchFirebaseCollection('sales'),
                    this.fetchFirebaseCollection('inventory'),
                    this.fetchFirebaseCollection('production'),
                    this.fetchFirebaseCollection('feedRecords'),
                    this.fetchFirebaseDocument('profile', this.farmId)
                ]);

                // Calculate stats from Firebase data
                return this.calculateStatsFromFirebase(
                    transactions, sales, inventory, production, feedRecords, profile
                );
            } catch (error) {
                console.error('Error fetching from Firebase:', error);
                // Fallback to localStorage
                return this.getFarmStatsFromLocalStorage();
            }
        } else {
            // Use localStorage only
            return this.getFarmStatsFromLocalStorage();
        }
    },

    async fetchFirebaseCollection(collectionName) {
        try {
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

    async fetchFirebaseDocument(collectionName, docId) {
        try {
            const doc = await this.db
                .collection('farms')
                .doc(this.farmId)
                .collection(collectionName)
                .doc(docId)
                .get();
            
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`Error fetching document ${docId}:`, error);
            return null;
        }
    },

    calculateStatsFromFirebase(transactions, sales, inventory, production, feedRecords, profile) {
        // Calculate total revenue from sales
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        
        // Calculate expenses from transactions
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const netProfit = totalRevenue - totalExpenses;
        
        // Calculate total production
        const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
        
        // Count low stock items
        const lowStockItems = inventory.filter(item => 
            (item.currentStock || 0) <= (item.minStock || 0)
        ).length;
        
        // Calculate total feed used
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
        
        // Get total birds from profile or inventory
        const totalBirds = profile?.currentStock || 
                          inventory.find(item => item.type === 'birds')?.currentStock || 
                          0;

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

    // ==================== UPDATED REPORT GENERATION WITH FIREBASE ====================
    async generateFinancialReport() {
        try {
            console.log('💰 Generating financial report...');
            
            let transactions, sales;
            
            if (this.db && this.farmId) {
                // Fetch from Firebase
                [transactions, sales] = await Promise.all([
                    this.fetchFirebaseCollection('transactions'),
                    this.fetchFirebaseCollection('sales')
                ]);
            } else {
                // Fallback to localStorage
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

                <!-- Rest of the report content remains the same -->
                ${this.generateFinancialReportSections(incomeByCategory, expensesByCategory, totalIncome, totalExpenses, netProfit, profitMargin)}
            `;

            this.currentReport = {
                title: 'Financial Performance Report',
                content: reportContent,
                timestamp: new Date().toISOString(),
                type: 'financial'
            };
            
            this.showReport('Financial Performance Report', reportContent);
            
            // Save report to Firebase if available
            await this.saveReportToFirebase(this.currentReport);
            
        } catch (error) {
            console.error('Error generating financial report:', error);
            this.showNotification('Error generating report', 'error');
        }
    },

    generateFinancialReportSections(incomeByCategory, expensesByCategory, totalIncome, totalExpenses, netProfit, profitMargin) {
        return `
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
            
            // Continue with report generation...
            // (Similar pattern for all report types)
            
        } catch (error) {
            console.error('Error generating production report:', error);
        }
    },

    async saveReportToFirebase(report) {
        if (!this.db || !this.farmId) {
            // Save to localStorage as fallback
            const savedReports = JSON.parse(localStorage.getItem('farm-saved-reports') || '[]');
            savedReports.push(report);
            localStorage.setItem('farm-saved-reports', JSON.stringify(savedReports));
            return;
        }

        try {
            const reportRef = this.db
                .collection('farms')
                .doc(this.farmId)
                .collection('reports')
                .doc();
            
            await reportRef.set({
                ...report,
                farmId: this.farmId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Report saved to Firebase');
        } catch (error) {
            console.error('Error saving report to Firebase:', error);
            // Fallback to localStorage
            const savedReports = JSON.parse(localStorage.getItem('farm-saved-reports') || '[]');
            savedReports.push(report);
            localStorage.setItem('farm-saved-reports', JSON.stringify(savedReports));
        }
    },

    async sendEmailReport() {
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
            sent: false
        };
        
        try {
            // Save email to Firebase
            if (this.db && this.farmId) {
                const emailRef = this.db
                    .collection('farms')
                    .doc(this.farmId)
                    .collection('emails')
                    .doc();
                
                await emailRef.set({
                    ...emailData,
                    farmId: this.farmId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'pending'
                });
                
                // In a real app, this would trigger a cloud function to send the email
                console.log('📧 Email queued for sending via Firebase');
                
                // Update status
                await emailRef.update({ status: 'sent', sentAt: firebase.firestore.FieldValue.serverTimestamp() });
            }
            
            // Also save to localStorage for offline access
            const sentEmails = JSON.parse(localStorage.getItem('farm-sent-emails') || '[]');
            sentEmails.push({...emailData, sent: true});
            localStorage.setItem('farm-sent-emails', JSON.stringify(sentEmails));
            
            this.showNotification(`Report sent to ${emailData.recipient}`, 'success');
            this.hideEmailModal();
            
        } catch (error) {
            console.error('Error sending email:', error);
            this.showNotification('Failed to send email', 'error');
        }
    },

    // Rest of the utility functions remain the same...
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    // ... (all other utility functions remain the same)

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
    }
};

// Export the module
console.log('📊 Reports module loaded successfully!');
window.FarmModules = window.FarmModules || {};
window.FarmModules.reports = ReportsModule;
