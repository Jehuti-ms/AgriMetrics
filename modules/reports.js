// modules/reports.js - FOLLOWING WORKING PATTERN
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

                <!-- Quick Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                        <div style="font-size: 20px; font-weight: bold; color: #22c55e;">$5,420.00</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Net Profit</div>
                        <div style="font-size: 20px; font-weight: bold; color: #22c55e;">$1,850.00</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Birds</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">1,250</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">4,850 units</div>
                    </div>
                </div>

                <!-- Report Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <!-- Financial Report -->
                    <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Reports</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, profit analysis</p>
                        <button class="btn-primary generate-financial-report" style="width: 100%;">
                            Generate Report
                        </button>
                    </div>

                    <!-- Production Report -->
                    <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Reports</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production, poultry metrics</p>
                        <button class="btn-primary generate-production-report" style="width: 100%;">
                            Generate Report
                        </button>
                    </div>

                    <!-- Inventory Report -->
                    <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Reports</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels, reorder analysis</p>
                        <button class="btn-primary generate-inventory-report" style="width: 100%;">
                            Generate Report
                        </button>
                    </div>
                </div>

                <!-- Report Output Area -->
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

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Report generation buttons
        document.querySelector('.generate-financial-report')?.addEventListener('click', () => this.generateFinancialReport());
        document.querySelector('.generate-production-report')?.addEventListener('click', () => this.generateProductionReport());
        document.querySelector('.generate-inventory-report')?.addEventListener('click', () => this.generateInventoryReport());
    },

    // Report generation methods
    generateFinancialReport() {
        const content = `
            <h4>💰 Financial Report</h4>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Income:</strong> <span style="color: #22c55e">$5,420.00</span></p>
            <p><strong>Total Expenses:</strong> <span style="color: #ef4444">$3,570.00</span></p>
            <p><strong>Net Profit:</strong> <span style="color: #22c55e">$1,850.00</span></p>
            <hr>
            <p><strong>Report generated by:</strong> Farm Management System</p>
        `;
        this.showReport('Financial Report', content);
    },

    generateProductionReport() {
        const content = `
            <h4>🚜 Production Report</h4>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Production:</strong> 4,850 units</p>
            <p><strong>Average Daily:</strong> 162 units</p>
            <p><strong>Bird Count:</strong> 1,250 birds</p>
            <hr>
            <p><strong>Report generated by:</strong> Farm Management System</p>
        `;
        this.showReport('Production Report', content);
    },

    generateInventoryReport() {
        const content = `
            <h4>📦 Inventory Report</h4>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Items:</strong> 15 items</p>
            <p><strong>Low Stock Items:</strong> <span style="color: #f59e0b">3 items</span></p>
            <p><strong>Out of Stock:</strong> <span style="color: #ef4444">0 items</span></p>
            <hr>
            <p><strong>Report generated by:</strong> Farm Management System</p>
        `;
        this.showReport('Inventory Report', content);
    },

    // Core functions you wanted
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
    }
};

// ⚠️ CRITICAL: Use the EXACT same registration as other working modules
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered with FarmModules');
}

// Also register directly just in case
window.FarmModules = window.FarmModules || {};
window.FarmModules.reports = ReportsModule;
console.log('📊 Reports module script completed');
