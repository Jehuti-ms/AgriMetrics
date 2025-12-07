// modules/reports.js - WITH EMAIL MODAL COMPONENT
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,
    currentReport: null,

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
                    
                    <!-- Inventory Report -->
                    <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Report</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels and reorder analysis</p>
                        <button onclick="window.FarmModules.reports.generateInventoryReport()" 
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
                            <button onclick="window.FarmModules.reports.showEmailModal()" 
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

            <!-- Email Modal (Hidden by default) -->
            <div id="email-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                <div style="background: var(--bg-primary); border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin: 0;">📧 Email Report</h3>
                        <button onclick="window.FarmModules.reports.hideEmailModal()" 
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary); padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                            &times;
                        </button>
                    </div>
                    <div style="padding: 20px;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">Recipient Email *</label>
                            <input type="email" id="recipient-email" 
                                   style="width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 14px;"
                                   placeholder="recipient@example.com" required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">Subject</label>
                            <input type="text" id="email-subject" 
                                   style="width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 14px;"
                                   placeholder="Farm Report - ${new Date().toLocaleDateString()}">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">Message (Optional)</label>
                            <textarea id="email-message" rows="4"
                                   style="width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 14px; resize: vertical;"
                                   placeholder="Add a personal message..."></textarea>
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">Format</label>
                            <select id="email-format" 
                                   style="width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 14px;">
                                <option value="plain">Plain Text</option>
                                <option value="html">HTML Format</option>
                                <option value="pdf">PDF Attachment</option>
                            </select>
                        </div>
                    </div>
                    <div style="padding: 20px; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="window.FarmModules.reports.hideEmailModal()" 
                                style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                            Cancel
                        </button>
                        <button onclick="window.FarmModules.reports.sendEmail()" 
                                style="background: var(--primary-color); color: white; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Send Email
                        </button>
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
        
        const incomeByCategory = {};
        const expensesByCategory = {};
        
        transactions.forEach(t => {
            if (t.type === 'income') {
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            } else {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            }
        });
        
        this.currentReport = {
            title: 'Financial Report',
            content: `
                <h4>💰 Financial Report</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="padding: 16px; background: #f0fdf4; border-radius: 8px;">
                        <h5 style="margin: 0 0 10px 0; color: #166534;">Income Summary</h5>
                        <p><strong>Total Income:</strong> <span style="color: #22c55e">${this.formatCurrency(income)}</span></p>
                        ${Object.entries(incomeByCategory).map(([cat, amt]) => `
                            <p style="margin-left: 15px;"><strong>${cat}:</strong> ${this.formatCurrency(amt)}</p>
                        `).join('')}
                    </div>
                    <div style="padding: 16px; background: #fef2f2; border-radius: 8px;">
                        <h5 style="margin: 0 0 10px 0; color: #991b1b;">Expense Summary</h5>
                        <p><strong>Total Expenses:</strong> <span style="color: #ef4444">${this.formatCurrency(expenses)}</span></p>
                        ${Object.entries(expensesByCategory).map(([cat, amt]) => `
                            <p style="margin-left: 15px;"><strong>${cat}:</strong> ${this.formatCurrency(amt)}</p>
                        `).join('')}
                    </div>
                </div>
                <div style="padding: 16px; background: ${profit >= 0 ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px; text-align: center;">
                    <h5 style="margin: 0 0 10px 0; color: ${profit >= 0 ? '#166534' : '#991b1b'};">Net Profit</h5>
                    <p style="font-size: 24px; font-weight: bold; color: ${profit >= 0 ? '#22c55e' : '#ef4444'}">
                        ${this.formatCurrency(profit)}
                    </p>
                    <p style="font-size: 14px; color: var(--text-secondary);">
                        ${profit >= 0 ? '✅ Profitable' : '⚠️ Operating at a loss'}
                    </p>
                </div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--glass-border);">
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Generated by:</strong> Farm Management System</p>
                    <p><strong>Data Source:</strong> ${transactions.length} transaction records</p>
                </div>
            `
        };
        
        this.showReport(this.currentReport.title, this.currentReport.content);
    },

    generateProductionReport() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const total = production.reduce((sum, record) => sum + record.quantity, 0);
        
        const byProduct = {};
        production.forEach(record => {
            byProduct[record.product] = (byProduct[record.product] || 0) + record.quantity;
        });
        
        this.currentReport = {
            title: 'Production Report',
            content: `
                <h4>🚜 Production Report</h4>
                <div style="padding: 16px; background: #eff6ff; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="margin: 0 0 10px 0; color: #1e40af;">Production Overview</h5>
                    <p><strong>Total Production:</strong> ${total} units</p>
                    <p><strong>Number of Records:</strong> ${production.length}</p>
                    <p><strong>Average Daily:</strong> ${(total / Math.max(production.length, 1)).toFixed(1)} units</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h5 style="margin: 0 0 10px 0; color: var(--text-primary);">Production by Product</h5>
                    ${Object.entries(byProduct).map(([product, quantity]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--glass-border);">
                            <span>${product}</span>
                            <span style="font-weight: bold;">${quantity} units</span>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h5 style="margin: 0 0 10px 0; color: var(--text-primary);">Recent Production</h5>
                    ${production.slice(-5).map(record => `
                        <div style="padding: 8px; border-bottom: 1px solid var(--glass-border);">
                            <strong>${record.date}</strong>: ${record.quantity} ${record.unit} of ${record.product}
                            ${record.quality ? `<span style="color: #f59e0b; margin-left: 10px;">(${record.quality})</span>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--glass-border);">
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Time Period:</strong> Last ${production.length} days</p>
                </div>
            `
        };
        
        this.showReport(this.currentReport.title, this.currentReport.content);
    },

    generateInventoryReport() {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const lowStock = inventory.filter(item => item.currentStock <= item.minStock);
        
        this.currentReport = {
            title: 'Inventory Report',
            content: `
                <h4>📦 Inventory Report</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="padding: 16px; background: #fef7ed; border-radius: 8px;">
                        <h5 style="margin: 0 0 10px 0; color: #92400e;">Inventory Summary</h5>
                        <p><strong>Total Items:</strong> ${inventory.length}</p>
                        <p><strong>Low Stock Items:</strong> <span style="color: ${lowStock.length > 0 ? '#f59e0b' : '#22c55e'}">${lowStock.length}</span></p>
                        <p><strong>Total Value:</strong> ${this.formatCurrency(
                            inventory.reduce((sum, item) => sum + (item.currentStock * (item.unitPrice || 0)), 0)
                        )}</p>
                    </div>
                    
                    <div style="padding: 16px; background: ${lowStock.length > 0 ? '#fef2f2' : '#f0fdf4'}; border-radius: 8px;">
                        <h5 style="margin: 0 0 10px 0; color: ${lowStock.length > 0 ? '#991b1b' : '#166534'};">Stock Status</h5>
                        <p>${lowStock.length > 0 ? '⚠️ Some items need reordering' : '✅ All items sufficiently stocked'}</p>
                    </div>
                </div>
                
                ${lowStock.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h5 style="margin: 0 0 10px 0; color: #f59e0b;">⚠️ Low Stock Alerts</h5>
                        ${lowStock.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--glass-border); background: #fef3c7;">
                                <div>
                                    <strong>${item.name}</strong><br>
                                    <small>Current: ${item.currentStock} | Minimum: ${item.minStock}</small>
                                </div>
                                <span style="color: #f59e0b; font-weight: bold;">Need ${item.minStock - item.currentStock} more</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 20px;">
                    <h5 style="margin: 0 0 10px 0; color: var(--text-primary);">All Inventory Items</h5>
                    ${inventory.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--glass-border);">
                            <div>
                                <strong>${item.name}</strong><br>
                                <small>${item.category || 'Uncategorized'}</small>
                            </div>
                            <div style="text-align: right;">
                                <div>${item.currentStock} units</div>
                                <small>Min: ${item.minStock}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--glass-border);">
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Recommendation:</strong> ${lowStock.length > 0 ? 'Reorder low stock items immediately.' : 'Maintain current stock levels.'}</p>
                </div>
            `
        };
        
        this.showReport(this.currentReport.title, this.currentReport.content);
    },

    // ==================== REPORT DISPLAY ====================
    showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-date').textContent = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').style.display = 'block';
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    },

    closeReport() {
        document.getElementById('report-output').style.display = 'none';
        this.currentReport = null;
    },

    // ==================== EMAIL MODAL FUNCTIONS ====================
    showEmailModal() {
        if (!this.currentReport) {
            alert('Please generate a report first');
            return;
        }
        
        // Pre-fill the subject
        document.getElementById('email-subject').value = `Farm Report: ${this.currentReport.title} - ${new Date().toLocaleDateString()}`;
        
        // Show modal
        document.getElementById('email-modal').style.display = 'flex';
    },

    hideEmailModal() {
        document.getElementById('email-modal').style.display = 'none';
        
        // Clear form
        document.getElementById('recipient-email').value = '';
        document.getElementById('email-message').value = '';
        document.getElementById('email-format').value = 'plain';
    },

    sendEmail() {
        const email = document.getElementById('recipient-email').value.trim();
        const subject = document.getElementById('email-subject').value.trim();
        const message = document.getElementById('email-message').value.trim();
        const format = document.getElementById('email-format').value;
        
        // Validate email
        if (!email) {
            alert('Please enter recipient email address');
            return;
        }
        
        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Prepare email content
        const reportTitle = this.currentReport.title;
        const reportContent = document.getElementById('report-content').textContent;
        const reportHtml = document.getElementById('report-content').innerHTML;
        
        let emailBody = '';
        
        if (format === 'html') {
            emailBody = `
                <h2>${reportTitle}</h2>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                <hr>
                ${reportHtml}
                ${message ? `<hr><p>${message.replace(/\n/g, '<br>')}</p>` : ''}
                <hr>
                <p><em>Sent from Farm Management System</em></p>
            `;
        } else {
            emailBody = `
${reportTitle}

Generated: ${new Date().toLocaleDateString()}

${reportContent}

${message ? `\n---\n${message}\n` : ''}

---
Sent from Farm Management System
            `;
        }
        
        // Encode for mailto
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(emailBody);
        
        // Open email client
        window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}${format === 'html' ? '&body=' + encodeURIComponent(emailBody) : ''}`);
        
        // Hide modal and show confirmation
        this.hideEmailModal();
        
        // Show success message
        setTimeout(() => {
            alert(`Email opened for ${email}. Please send from your email client.`);
        }, 100);
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // ==================== PRINT FUNCTION ====================
    printReport() {
        if (!this.currentReport) {
            alert('Please generate a report first');
            return;
        }
        
        const content = document.getElementById('report-content').innerHTML;
        const title = document.getElementById('report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @media print {
                            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12pt; }
                            h1 { color: #333; margin-bottom: 10px; }
                            h4 { color: #555; margin-top: 20px; }
                            p { margin: 8px 0; }
                            hr { margin: 20px 0; border: none; border-top: 1px solid #ccc; }
                            .section { margin-bottom: 20px; }
                            .alert { background: #fef3c7; padding: 10px; border-radius: 4px; border-left: 4px solid #f59e0b; }
                            .success { background: #f0fdf4; padding: 10px; border-radius: 4px; border-left: 4px solid #22c55e; }
                            .warning { background: #fef2f2; padding: 10px; border-radius: 4px; border-left: 4px solid #ef4444; }
                            .info { background: #eff6ff; padding: 10px; border-radius: 4px; border-left: 4px solid #3b82f6; }
                            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                            small { font-size: 10pt; color: #666; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    <hr>
                    ${content}
                    <hr>
                    <p style="text-align: center; font-size: 10pt; color: #666;">
                        Printed from Farm Management System • ${new Date().toLocaleDateString()}
                    </p>
                </body>
            </html>
        `);
        printWindow.document.close();
        
        // Wait a bit for content to load, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    },

    // ==================== DOWNLOAD FUNCTION ====================
    downloadReport() {
        if (!this.currentReport) {
            alert('Please generate a report first');
            return;
        }
        
        const title = document.getElementById('report-title').textContent;
        const content = document.getElementById('report-content').textContent;
        const date = new Date().toISOString().split('T')[0];
        
        const fullContent = `
${title}
${'='.repeat(title.length)}

Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

${content}

---
Report generated by Farm Management System
${window.location.hostname || 'localhost'}
        `.trim();
        
        const blob = new Blob([fullContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show confirmation
        setTimeout(() => {
            alert('Report downloaded successfully!');
        }, 100);
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

console.log('✅ Reports module loaded with complete email modal component');
