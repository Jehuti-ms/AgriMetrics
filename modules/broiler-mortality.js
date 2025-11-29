// modules/broiler-mortality.js - COMPLETE REWRITE WITH PROPER POPOUT MODALS
console.log('Loading broiler-mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    mortalityRecords: [],

    initialize() {
        console.log('😔 Initializing broiler mortality...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
        const saved = localStorage.getItem('farm-mortality-records');
        this.mortalityRecords = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            { id: 1, date: '2024-03-15', quantity: 2, cause: 'natural', notes: 'Found in morning check' },
            { id: 2, date: '2024-03-14', quantity: 1, cause: 'predator', notes: 'Fox attack overnight' },
            { id: 3, date: '2024-03-13', quantity: 3, cause: 'disease', notes: 'Respiratory issues' }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Broiler Health & Mortality</h1>
                    <p class="module-subtitle">Monitor flock health and track losses</p>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">😔</div>
                        <div class="stat-value">${stats.totalLosses}</div>
                        <div class="stat-label">Total Losses</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value ${stats.mortalityRate > 5 ? 'stat-warning' : 'stat-success'}">${stats.mortalityRate}%</div>
                        <div class="stat-label">Mortality Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🐔</div>
                        <div class="stat-value">${stats.currentStock}</div>
                        <div class="stat-label">Current Birds</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-value">${stats.recordsCount}</div>
                        <div class="stat-label">Records</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-mortality-btn">
                        <div class="quick-action-icon">📝</div>
                        <span class="quick-action-title">Record Mortality</span>
                        <span class="quick-action-subtitle">Log bird losses</span>
                    </button>
                    <button class="quick-action-btn" id="health-report-btn">
                        <div class="quick-action-icon">📈</div>
                        <span class="quick-action-title">Health Report</span>
                        <span class="quick-action-subtitle">View health analytics</span>
                    </button>
                </div>

                <!-- Mortality Form -->
                <div class="glass-card">
                    <h3 class="section-title">Record Mortality</h3>
                    <form id="mortality-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Number of Birds</label>
                                <input type="number" class="form-input" id="mortality-quantity" min="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Cause of Death</label>
                                <select class="form-input" id="mortality-cause" required>
                                    <option value="natural">Natural Causes</option>
                                    <option value="disease">Disease</option>
                                    <option value="predator">Predator</option>
                                    <option value="accident">Accident</option>
                                    <option value="heat-stress">Heat Stress</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="mortality-notes" rows="3" placeholder="Observations, symptoms, location..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Save Mortality Record</button>
                    </form>
                </div>

                <!-- Recent Mortality Records -->
                <div class="glass-card">
                    <div class="section-header">
                        <h3 class="section-title">Recent Mortality Records</h3>
                    </div>
                    <div id="mortality-list">
                        ${this.renderMortalityList()}
                    </div>
                </div>
            </div>

            <!-- Health Report Popout Modal -->
            <div id="health-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="health-report-title">Health Report</h3>
                        <button class="popout-modal-close" id="close-health-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="health-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-health-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-health-report-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalLosses = this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        const currentStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        const mortalityRate = currentStock > 0 ? ((totalLosses / currentStock) * 100).toFixed(2) : '0.00';
        
        return {
            totalLosses,
            mortalityRate,
            currentStock,
            recordsCount: this.mortalityRecords.length
        };
    },

    renderMortalityList() {
        if (this.mortalityRecords.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">😔</div>
                    <div class="empty-title">No mortality records</div>
                    <div class="empty-subtitle">No losses recorded - great job!</div>
                </div>
            `;
        }

        return `
            <div class="records-list">
                ${this.mortalityRecords.slice(0, 10).map(record => `
                    <div class="record-item">
                        <div class="record-main">
                            <div class="record-icon">${this.getCauseIcon(record.cause)}</div>
                            <div class="record-details">
                                <div class="record-title">${this.formatCause(record.cause)}</div>
                                <div class="record-meta">${record.date}</div>
                                ${record.notes ? `<div class="record-notes">${record.notes}</div>` : ''}
                            </div>
                        </div>
                        <div class="record-quantity loss">${record.quantity} birds</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getCauseIcon(cause) {
        const icons = {
            'natural': '🌿',
            'disease': '🤒',
            'predator': '🦊',
            'accident': '⚠️',
            'heat-stress': '🔥',
            'other': '❓'
        };
        return icons[cause] || '❓';
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator',
            'accident': 'Accident',
            'heat-stress': 'Heat Stress',
            'other': 'Other'
        };
        return causes[cause] || cause;
    },

    setupEventListeners() {
        // Mortality form
        document.getElementById('mortality-form')?.addEventListener('submit', (e) => this.handleMortalitySubmit(e));
        
        // Report button
        document.getElementById('health-report-btn')?.addEventListener('click', () => this.generateHealthReport());
        
        // Modal controls
        document.getElementById('close-health-report')?.addEventListener('click', () => this.hideHealthReportModal());
        document.getElementById('close-health-report-btn')?.addEventListener('click', () => this.hideHealthReportModal());
        document.getElementById('print-health-report')?.addEventListener('click', () => this.printHealthReport());

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideHealthReportModal();
            }
        });
    },

    handleMortalitySubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            quantity: parseInt(document.getElementById('mortality-quantity').value),
            cause: document.getElementById('mortality-cause').value,
            notes: document.getElementById('mortality-notes').value || ''
        };

        this.mortalityRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Mortality record saved successfully!', 'success');
        }
    },

    generateHealthReport() {
        const stats = this.calculateStats();
        const recentRecords = this.mortalityRecords.slice(0, 10);

        // Calculate cause distribution
        const causeDistribution = {};
        this.mortalityRecords.forEach(record => {
            causeDistribution[record.cause] = (causeDistribution[record.cause] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4 class="report-section-title">Flock Health Overview</h4>
                <div class="stats-grid-compact">
                    <div class="stat-card-compact stat-primary">
                        <div class="stat-label">Current Bird Count</div>
                        <div class="stat-value">${stats.currentStock}</div>
                    </div>
                    <div class="stat-card-compact stat-danger">
                        <div class="stat-label">Total Mortality</div>
                        <div class="stat-value">${stats.totalLosses}</div>
                    </div>
                    <div class="stat-card-compact ${stats.mortalityRate > 5 ? 'stat-warning' : 'stat-success'}">
                        <div class="stat-label">Mortality Rate</div>
                        <div class="stat-value">${stats.mortalityRate}%</div>
                    </div>
                    <div class="stat-card-compact stat-info">
                        <div class="stat-label">Records</div>
                        <div class="stat-value">${stats.recordsCount}</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4 class="report-section-title">Mortality by Cause</h4>
                <div class="cause-distribution">
                    ${Object.entries(causeDistribution).map(([cause, count]) => `
                        <div class="cause-item">
                            <div class="cause-header">
                                <span class="cause-icon">${this.getCauseIcon(cause)}</span>
                                <span class="cause-name">${this.formatCause(cause)}</span>
                            </div>
                            <div class="cause-count">${count} birds</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4 class="report-section-title">Recent Mortality Activity</h4>
                <div class="recent-activity">
                    ${recentRecords.map(record => `
                        <div class="activity-item">
                            <div class="activity-details">
                                <div class="activity-title">${this.formatCause(record.cause)}</div>
                                <div class="activity-date">${record.date}</div>
                            </div>
                            <div class="activity-quantity loss">${record.quantity} birds</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4 class="report-section-title">Health Recommendations</h4>
                <div class="recommendation-box ${this.getRecommendationLevel(stats.mortalityRate, causeDistribution)}">
                    <p>${this.getHealthRecommendations(stats.mortalityRate, causeDistribution)}</p>
                </div>
            </div>
        `;

        document.getElementById('health-report-content').innerHTML = reportContent;
        this.showHealthReportModal();
    },

    showHealthReportModal() {
        document.getElementById('health-report-modal').classList.remove('hidden');
    },

    hideHealthReportModal() {
        document.getElementById('health-report-modal').classList.add('hidden');
    },

    printHealthReport() {
        const reportContent = document.getElementById('health-report-content').innerHTML;
        const reportTitle = document.getElementById('health-report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #1f2937;
                            line-height: 1.6;
                        }
                        .report-section { 
                            margin-bottom: 30px; 
                            break-inside: avoid;
                        }
                        .report-section-title {
                            color: #1f2937;
                            font-size: 18px;
                            font-weight: 600;
                            margin-bottom: 16px;
                            border-bottom: 2px solid #3b82f6;
                            padding-bottom: 8px;
                        }
                        .stats-grid-compact {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 12px;
                            margin-bottom: 20px;
                        }
                        .stat-card-compact {
                            padding: 16px;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e5e7eb;
                        }
                        .stat-primary { background: #eff6ff; }
                        .stat-danger { background: #fef2f2; }
                        .stat-warning { background: #fef3c7; }
                        .stat-success { background: #f0fdf4; }
                        .stat-info { background: #faf5ff; }
                        .stat-label {
                            font-size: 14px;
                            color: #6b7280;
                            margin-bottom: 4px;
                        }
                        .stat-value {
                            font-size: 20px;
                            font-weight: 700;
                            color: #1f2937;
                        }
                        .cause-item, .activity-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .cause-header, .activity-details {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .recommendation-box {
                            padding: 16px;
                            border-radius: 8px;
                            border-left: 4px solid;
                        }
                        .recommendation-critical { 
                            background: #fef2f2; 
                            border-left-color: #dc2626;
                        }
                        .recommendation-warning { 
                            background: #fef3c7; 
                            border-left-color: #d97706;
                        }
                        .recommendation-info { 
                            background: #eff6ff; 
                            border-left-color: #3b82f6;
                        }
                        .recommendation-success { 
                            background: #f0fdf4; 
                            border-left-color: #16a34a;
                        }
                        @media print {
                            body { margin: 0.5in; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #6b7280; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    getRecommendationLevel(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) return 'recommendation-critical';
        if (mortalityRate > 5) return 'recommendation-warning';
        if (causeDistribution.disease > 0) return 'recommendation-info';
        return 'recommendation-success';
    },

    getHealthRecommendations(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) {
            return "⚠️ CRITICAL: Mortality rate is very high! Immediate veterinary consultation required. Isolate sick birds and review all management practices including feed quality, water supply, and environmental conditions.";
        } else if (mortalityRate > 5) {
            return "⚠️ WARNING: Elevated mortality rate detected. Monitor flock closely, check feed and water quality, ensure proper ventilation, and consider preventive measures. Review biosecurity protocols.";
        } else if (causeDistribution.disease > 0) {
            return "🦠 Disease cases present. Enhance biosecurity measures, consider vaccination program, monitor for symptoms in the flock, and maintain strict sanitation practices. Isolate affected birds immediately.";
        } else if (causeDistribution.predator > 0) {
            return "🦊 Predator activity detected. Strengthen coop security with reinforced fencing, install predator deterrents, conduct regular perimeter checks, and ensure proper nighttime enclosure.";
        } else if (causeDistribution['heat-stress'] > 0) {
            return "🔥 Heat stress issues. Ensure adequate ventilation, provide cool fresh water, consider misting systems, provide shade structures, and adjust feeding schedules during hot periods.";
        } else {
            return "✅ Excellent flock health! Maintain current management practices, continue regular monitoring, ensure proper nutrition, and keep up with preventive care and biosecurity measures.";
        }
    },

    saveData() {
        localStorage.setItem('farm-mortality-records', JSON.stringify(this.mortalityRecords));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
}
