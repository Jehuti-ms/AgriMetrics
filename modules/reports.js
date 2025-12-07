// modules/reports.js - SIMPLIFIED WORKING VERSION
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,

    initialize() {
        console.log('📈 Initializing reports...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        this.renderModule();
        this.initialized = true;
        
        // Register with FarmModules
        window.FarmModules = window.FarmModules || {};
        window.FarmModules.reports = this;
        
        return true;
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
                <h1 style="color: var(--text-primary); margin-bottom: 8px;">Farm Reports</h1>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Generate and export farm reports</p>
                
                <!-- Quick Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    ${this.renderQuickStats()}
                </div>
                
                <!-- Report Types -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <!-- Financial Report -->
                    <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Report</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, and profit analysis</p>
                        <button onclick="window.FarmModules.reports.generateFinancialReport()" 
                                style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%;">
                            Generate Report
                        </button>
                    </div>
                    
                    <!-- Production Report -->
                    <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Report</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production and poultry metrics</p>
                        <button onclick="window.FarmModules.reports.generateProductionReport()" 
                                style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%;">
                            Generate Report
                        </button>
                    </div>
                </div>
                
                <!-- Report Output Area (Hidden by default) -->
                <div id="report-output" style="display: none; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; margin-top: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--glass-border);">
                        <div>
                            <h3 style="color: var(--text-primary); margin: 0;" id="report-title">Report</h3>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;" id="report-date">
                                ${new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="window.FarmModules.reports.printReport()" 
                                    style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                🖨️ Print
                            </button>
                            <button onclick="window.FarmModules.reports.downloadReport()" 
                                    style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                📥 Download
                            </button>
                            <button onclick="window.FarmModules.reports.emailReport()" 
                                    style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                📧 Email
                            </button>
                            <button onclick="window.FarmModules.reports.closeReport()" 
                                    style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    <div style="padding: 24px;">
                        <div id="report-content">
                            <!-- Report content goes here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderQuickStats() {
        const stats = this.getFarmStats();
        
        return `
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary);">Net Profit</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary);">Total Birds</div>
                <div style="font-size: 20px; font-weight: bold;">${stats.totalBirds}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary);">Production</div>
                <div style="font-size: 20px; font-weight: bold;">${stats.totalProduction}</div>
            </div>
        `;
    },

    getFarmStats() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            totalRevenue,
            netProfit: totalRevenue - totalExpenses,
            totalBirds: parseInt(localStorage.getItem('farm-current-stock') || '1000'),
            totalProduction: production.reduce((sum, record) => sum + record.quantity, 0)
        };
    },

    // ==================== REPORT GENERATION ====================
    generateFinancialReport() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const profit = income - expenses;
        
        const content = `
            <h4>Financial Report</h4>
            <p><strong>Total Income:</strong> <span style="color: #22c55e">${this.formatCurrency(income)}</span></p>
            <p><strong>Total Expenses:</strong> <span style="color: #ef4444">${this.formatCurrency(expenses)}</span></p>
            <p><strong>Net Profit:</strong> <span style="color: ${profit >= 0 ? '#22c55e' : '#ef4444'}">${this.formatCurrency(profit)}</span></p>
            <hr>
            <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Generated by:</strong> Farm Management System</p>
        `;
        
        this.showReport('Financial Report', content);
    },

    generateProductionReport() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const total = production.reduce((sum, record) => sum + record.quantity, 0);
        
        const content = `
            <h4>Production Report</h4>
            <p><strong>Total Production:</strong> ${total} units</p>
            <p><strong>Number of Records:</strong> ${production.length}</p>
            <hr>
            <p><strong>Latest Production:</strong></p>
            ${production.slice(-5).map(record => `
                <p style="margin-left: 20px;">• ${record.date}: ${record.quantity} ${record.unit} of ${record.product}</p>
            `).join('')}
        `;
        
        this.showReport('Production Report', content);
    },

    // ==================== EXPORT FUNCTIONS ====================
    showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-date').textContent = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').style.display = 'block';
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    },

    closeReport() {
        document.getElementById('report-output').style.display = 'none';
    },

    printReport() {
        const content = document.getElementById('report-content').innerHTML;
        const title = document.getElementById('report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        p { margin: 10px 0; }
                        hr { margin: 20px 0; border: none; border-top: 1px solid #ccc; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                    <hr>
                    ${content}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    downloadReport() {
        const title = document.getElementById('report-title').textContent;
        const content = document.getElementById('report-content').textContent;
        const date = new Date().toISOString().split('T')[0];
        
        const blob = new Blob([`${title}\n\n${content}\n\nGenerated: ${new Date().toLocaleDateString()}`], {
            type: 'text/plain'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Report downloaded successfully!');
    },

    emailReport() {
        const title = document.getElementById('report-title').textContent;
        const content = document.getElementById('report-content').textContent;
        
        const email = prompt('Enter email address to send report to:');
        if (!email) return;
        
        const subject = encodeURIComponent(`Farm Report: ${title}`);
        const body = encodeURIComponent(`Here is your farm report:\n\n${content}\n\nGenerated on: ${new Date().toLocaleDateString()}`);
        
        window.open(`mailto:${email}?subject=${subject}&body=${body}`);
        
        alert(`Report email opened for ${email}. Please send from your email client.`);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

// Register the module
window.FarmModules = window.FarmModules || {};
window.FarmModules.reports = ReportsModule;

console.log('✅ Reports module loaded with email/download/print functions');
