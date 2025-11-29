// modules/production.js - COMPLETE REWRITE WITH POPOUT MODAL
console.log('Loading production module...');

const ProductionModule = {
    name: 'production',
    initialized: false,
    productionRecords: [],

    initialize() {
        console.log('🚜 Initializing production...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
        const saved = localStorage.getItem('farm-production');
        this.productionRecords = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            { id: 1, date: '2024-03-15', product: 'eggs', quantity: 450, unit: 'pieces', quality: 'grade-a', notes: 'Morning collection' },
            { id: 2, date: '2024-03-14', product: 'eggs', quantity: 420, unit: 'pieces', quality: 'grade-a', notes: 'Regular production' },
            { id: 3, date: '2024-03-13', product: 'broilers', quantity: 50, unit: 'birds', quality: 'excellent', notes: 'Weekly harvest' }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Production Records</h1>
                    <p class="module-subtitle">Track your farm production and yields</p>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🥚</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalEggs}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Eggs Today</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalBirds}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Birds This Week</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalRecords}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Records</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.avgQuality}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Avg Quality</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-production-btn">
                        <div style="font-size: 32px;">📝</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Production</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Log daily production</span>
                    </button>
                    <button class="quick-action-btn" id="production-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Production Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View production analytics</span>
                    </button>
                </div>

                <!-- Production Form -->
                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">Record Production</h3>
                    <form id="production-form">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label class="form-label">Product Type</label>
                                <select class="form-input" id="product-type" required>
                                    <option value="eggs">Eggs</option>
                                    <option value="broilers">Broilers</option>
                                    <option value="layers">Layers</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Quantity</label>
                                <input type="number" class="form-input" id="production-quantity" min="1" required>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label class="form-label">Quality</label>
                                <select class="form-input" id="production-quality" required>
                                    <option value="excellent">Excellent</option>
                                    <option value="grade-a">Grade A</option>
                                    <option value="grade-b">Grade B</option>
                                    <option value="rejects">Rejects</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Unit</label>
                                <select class="form-input" id="production-unit" required>
                                    <option value="pieces">Pieces</option>
                                    <option value="birds">Birds</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="crates">Crates</option>
                                </select>
                            </div>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="production-notes" rows="3" placeholder="Production details, observations..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Save Production Record</button>
                    </form>
                </div>

                <!-- Production Report Modal -->
                <div id="production-report-modal" class="popout-modal hidden">
                    <div class="popout-modal-content" style="max-width: 800px;">
                        <div class="popout-modal-header">
                            <h3 class="popout-modal-title" id="production-report-title">Production Report</h3>
                            <button class="popout-modal-close" id="close-production-report">&times;</button>
                        </div>
                        <div class="popout-modal-body">
                            <div id="production-report-content">
                                <!-- Report content will be inserted here -->
                            </div>
                        </div>
                        <div class="popout-modal-footer">
                            <button class="btn-outline" id="print-production-report">🖨️ Print</button>
                            <button class="btn-primary" id="close-production-report-btn">Close</button>
                        </div>
                    </div>
                </div>

                <!-- Recent Production -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Production</h3>
                    <div id="production-list">
                        ${this.renderProductionList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const today = new Date().toISOString().split('T')[0];
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysStr = last7Days.toISOString().split('T')[0];

        const todayProduction = this.productionRecords.filter(record => record.date === today);
        const last7DaysProduction = this.productionRecords.filter(record => record.date >= last7DaysStr);

        const totalEggs = todayProduction
            .filter(record => record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const totalBirds = last7DaysProduction
            .filter(record => record.product === 'broilers' || record.product === 'layers')
            .reduce((sum, record) => sum + record.quantity, 0);

        const qualityScores = {
            'excellent': 5,
            'grade-a': 4,
            'grade-b': 3,
            'rejects': 1
        };

        const avgQuality = this.productionRecords.length > 0 
            ? (this.productionRecords.reduce((sum, record) => sum + (qualityScores[record.quality] || 3), 0) / this.productionRecords.length).toFixed(1)
            : '0.0';

        return {
            totalEggs,
            totalBirds,
            totalRecords: this.productionRecords.length,
            avgQuality
        };
    },

    renderProductionList() {
        if (this.productionRecords.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No production records</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first production to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.productionRecords.slice(0, 10).map(record => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${this.getProductIcon(record.product)}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${record.product}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${record.date} • ${this.formatQuality(record.quality)}
                                </div>
                                ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${record.notes}</div>` : ''}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">
                                ${record.quantity} ${record.unit}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getProductIcon(product) {
        const icons = {
            'eggs': '🥚',
            'broilers': '🐔',
            'layers': '🐓',
            'other': '📦'
        };
        return icons[product] || '📦';
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent',
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'rejects': 'Rejects'
        };
        return qualities[quality] || quality;
    },

    setupEventListeners() {
        // Production form
        document.getElementById('production-form')?.addEventListener('submit', (e) => this.handleProductionSubmit(e));
        
        // Report button
        document.getElementById('production-report-btn')?.addEventListener('click', () => this.generateProductionReport());
        
        // Modal controls
        document.getElementById('close-production-report')?.addEventListener('click', () => this.hideProductionReportModal());
        document.getElementById('close-production-report-btn')?.addEventListener('click', () => this.hideProductionReportModal());
        document.getElementById('print-production-report')?.addEventListener('click', () => this.printProductionReport());
    },

    handleProductionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            product: document.getElementById('product-type').value,
            quantity: parseInt(document.getElementById('production-quantity').value),
            unit: document.getElementById('production-unit').value,
            quality: document.getElementById('production-quality').value,
            notes: document.getElementById('production-notes').value || ''
        };

        this.productionRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Production record saved successfully!', 'success');
        }
    },

    generateProductionReport() {
        const stats = this.calculateStats();
        const recentRecords = this.productionRecords.slice(0, 10);

        // Calculate product distribution
        const productDistribution = {};
        this.productionRecords.forEach(record => {
            productDistribution[record.product] = (productDistribution[record.product] || 0) + record.quantity;
        });

        // Calculate quality distribution
        const qualityDistribution = {};
        this.productionRecords.forEach(record => {
            qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
        });

        const reportContent = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">📊 Production Overview</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: #f0f9ff; border-radius: 8px;">
                        <div style="font-weight: 600; color: #1e40af;">Total Records</div>
                        <div style="font-size: 18px; font-weight: bold; color: #1e40af;">${stats.totalRecords}</div>
                    </div>
                    <div style="padding: 12px; background: #f0fdf4; border-radius: 8px;">
                        <div style="font-weight: 600; color: #166534;">Today's Eggs</div>
                        <div style="font-size: 18px; font-weight: bold; color: #166534;">${stats.totalEggs}</div>
                    </div>
                    <div style="padding: 12px; background: #fef3c7; border-radius: 8px;">
                        <div style="font-weight: 600; color: #92400e;">Weekly Birds</div>
                        <div style="font-size: 18px; font-weight: bold; color: #92400e;">${stats.totalBirds}</div>
                    </div>
                    <div style="padding: 12px; background: #faf5ff; border-radius: 8px;">
                        <div style="font-weight: 600; color: #7c3aed;">Avg Quality</div>
                        <div style="font-size: 18px; font-weight: bold; color: #7c3aed;">${stats.avgQuality}/5</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">📈 Product Distribution</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${Object.entries(productDistribution).map(([product, quantity]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="font-size: 16px;">${this.getProductIcon(product)}</div>
                                <span style="color: var(--text-primary); text-transform: capitalize;">${product}</span>
                            </div>
                            <span style="font-weight: 600; color: var(--text-primary);">${quantity} units</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">⭐ Quality Distribution</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${Object.entries(qualityDistribution).map(([quality, count]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                            <span style="color: var(--text-primary);">${this.formatQuality(quality)}</span>
                            <span style="font-weight: 600; color: var(--text-primary);">${count} records</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div>
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">📅 Recent Production Activity</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${recentRecords.map(record => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${record.product}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${record.date} • ${this.formatQuality(record.quality)}</div>
                            </div>
                            <span style="font-weight: 600; color: var(--text-primary);">${record.quantity} ${record.unit}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.showProductionReportModal('Production Analysis Report', reportContent);
    },

    showProductionReportModal(title, content) {
        document.getElementById('production-report-title').textContent = title;
        document.getElementById('production-report-content').innerHTML = content;
        document.getElementById('production-report-modal').classList.remove('hidden');
    },

    hideProductionReportModal() {
        document.getElementById('production-report-modal').classList.add('hidden');
    },

    printProductionReport() {
        const reportContent = document.getElementById('production-report-content').innerHTML;
        const reportTitle = document.getElementById('production-report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        h4 { color: #1a1a1a; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <h2>${reportTitle}</h2>
                    <div>Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    saveData() {
        localStorage.setItem('farm-production', JSON.stringify(this.productionRecords));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('production', ProductionModule);
}
