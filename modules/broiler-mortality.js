// modules/broiler-mortality.js - COMPLETE WITH SHARED DATA PATTERN
console.log('Loading broiler-mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    mortalityRecords: [],
    currentStock: 1000, // Starting stock

    initialize() {
        console.log('🐔 Initializing broiler mortality...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        
        // Sync initial stats with shared data
        this.syncStatsWithSharedData();
        
        return true;
    },

    loadData() {
        const savedRecords = localStorage.getItem('farm-mortality-records');
        const savedStock = localStorage.getItem('farm-current-stock');
        
        this.mortalityRecords = savedRecords ? JSON.parse(savedRecords) : this.getDemoData();
        this.currentStock = savedStock ? parseInt(savedStock) : 1000;
    },

    getDemoData() {
        return [
            { id: 1, date: '2024-03-15', quantity: 2, cause: 'natural', age: 28, notes: 'Found during morning check' },
            { id: 2, date: '2024-03-14', quantity: 1, cause: 'disease', age: 27, notes: 'Respiratory issues' },
            { id: 3, date: '2024-03-13', quantity: 3, cause: 'predator', age: 26, notes: 'Security breach' }
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
                    <p class="module-subtitle">Track bird health and losses</p>
                </div>

                <!-- Health Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.currentStock.toLocaleString()}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Current Stock</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">😔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalLosses}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Losses</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${stats.mortalityRate < 2 ? '#22c55e' : stats.mortalityRate < 5 ? '#f59e0b' : '#ef4444'}; margin-bottom: 4px;">${stats.mortalityRate}%</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Mortality Rate</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-mortality-btn">
                        <div style="font-size: 32px;">😔</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Loss</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Record mortality</span>
                    </button>
                    <button class="quick-action-btn" id="add-stock-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Birds</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new stock</span>
                    </button>
                    <button class="quick-action-btn" id="health-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Health Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View health analytics</span>
                    </button>
                </div>

                <!-- Record Mortality Form -->
                <div id="mortality-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Record Mortality</h3>
                        <form id="mortality-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" id="mortality-date" required>
                                </div>
                                <div>
                                    <label class="form-label">Number of Birds</label>
                                    <input type="number" class="form-input" id="mortality-quantity" min="1" max="${this.currentStock}" required>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                        Current stock: ${this.currentStock} birds
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Cause</label>
                                    <select class="form-input" id="mortality-cause" required>
                                        <option value="natural">Natural Causes</option>
                                        <option value="disease">Disease</option>
                                        <option value="predator">Predator</option>
                                        <option value="accident">Accident</option>
                                        <option value="heat-stress">Heat Stress</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Age (days)</label>
                                    <input type="number" class="form-input" id="mortality-age" min="1" max="60" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" id="mortality-notes" rows="3" placeholder="Any observations, symptoms, or additional information..."></textarea>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Record Loss</button>
                                <button type="button" class="btn-outline" id="cancel-mortality-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Add Stock Form -->
                <div id="stock-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Add Birds to Stock</h3>
                        <form id="stock-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" id="stock-date" required>
                                </div>
                                <div>
                                    <label class="form-label">Number of Birds</label>
                                    <input type="number" class="form-input" id="stock-quantity" min="1" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Source</label>
                                <select class="form-input" id="stock-source" required>
                                    <option value="hatchery">Hatchery</option>
                                    <option value="farm-bred">Farm Bred</option>
                                    <option value="purchase">Purchase</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Notes</label>
                                <input type="text" class="form-input" id="stock-notes" placeholder="Batch number, supplier, etc.">
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Add Birds</button>
                                <button type="button" class="btn-outline" id="cancel-stock-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Mortality & Health Alerts -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Recent Mortality -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">Recent Mortality Records</h3>
                            <button class="btn-primary" id="show-mortality-form">Record Loss</button>
                        </div>
                        <div id="mortality-records-list">
                            ${this.renderMortalityList()}
                        </div>
                    </div>

                    <!-- Health Alerts -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Health Alerts</h3>
                        <div id="health-alerts">
                            ${this.renderHealthAlerts()}
                        </div>
                    </div>
                </div>

                <!-- Mortality Trends -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Weekly Mortality Trends</h3>
                    <div id="mortality-trends">
                        ${this.renderMortalityTrends()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalLosses = this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        const mortalityRate = this.currentStock > 0 ? ((totalLosses / (this.currentStock + totalLosses)) * 100).toFixed(1) : 0;
        
        return { totalLosses, mortalityRate };
    },

    renderMortalityList() {
        if (this.mortalityRecords.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">😔</div>
                    <div style="font-size: 14px;">No mortality records</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Great job keeping your birds healthy!</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.mortalityRecords.slice(0, 6).map(record => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">
                                ${record.quantity} bird${record.quantity > 1 ? 's' : ''} • ${this.formatCause(record.cause)}
                            </div>
                            <div style="font-size: 14px; color: var(--text-secondary);">
                                ${record.date} • Age: ${record.age} days
                            </div>
                            ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${record.notes}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-icon delete-mortality" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderHealthAlerts() {
        const alerts = [];
        const stats = this.calculateStats();

        // Check mortality rate
        if (stats.mortalityRate > 5) {
            alerts.push({
                type: 'high-mortality',
                message: 'High mortality rate detected',
                severity: 'high',
                icon: '⚠️'
            });
        } else if (stats.mortalityRate > 2) {
            alerts.push({
                type: 'moderate-mortality',
                message: 'Moderate mortality rate',
                severity: 'medium',
                icon: '📊'
            });
        }

        // Check for disease patterns
        const diseaseCases = this.mortalityRecords.filter(record => record.cause === 'disease').length;
        if (diseaseCases > 2) {
            alerts.push({
                type: 'disease-pattern',
                message: 'Multiple disease cases reported',
                severity: 'high',
                icon: '🦠'
            });
        }

        // Check stock levels
        if (this.currentStock < 100) {
            alerts.push({
                type: 'low-stock',
                message: 'Low bird stock',
                severity: 'medium',
                icon: '📉'
            });
        }

        if (alerts.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">✅</div>
                    <div style="font-size: 14px;">No health alerts</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">All systems normal</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${alerts.map(alert => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${this.getAlertColor(alert.severity)}20; border-radius: 8px; border-left: 4px solid ${this.getAlertColor(alert.severity)};">
                        <div style="font-size: 20px;">${alert.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); font-size: 14px;">${alert.message}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderMortalityTrends() {
        // Group by week for simple trend analysis
        const weeklyData = {};
        this.mortalityRecords.forEach(record => {
            const week = this.getWeekNumber(new Date(record.date));
            if (!weeklyData[week]) {
                weeklyData[week] = 0;
            }
            weeklyData[week] += record.quantity;
        });

        const weeks = Object.keys(weeklyData).slice(-4); // Last 4 weeks

        if (weeks.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
                    <div style="font-size: 14px;">No trend data available</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Record more data to see trends</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; align-items: end; gap: 16px; height: 120px; padding: 20px 0;">
                ${weeks.map(week => {
                    const value = weeklyData[week];
                    const maxValue = Math.max(...Object.values(weeklyData));
                    const height = maxValue > 0 ? (value / maxValue) * 80 : 0;
                    
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                            <div style="width: 30px; background: #ef4444; border-radius: 4px; height: ${height}px;"></div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Week ${week}</div>
                            <div style="font-size: 11px; color: var(--text-primary); font-weight: 600;">${value}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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

    getAlertColor(severity) {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#3b82f6'
        };
        return colors[severity] || '#6b7280';
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('show-mortality-form')?.addEventListener('click', () => this.showMortalityForm());
        document.getElementById('record-mortality-btn')?.addEventListener('click', () => this.showMortalityForm());
        document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showStockForm());
        document.getElementById('health-report-btn')?.addEventListener('click', () => this.generateHealthReport());
        
        // Form handlers
        document.getElementById('mortality-form')?.addEventListener('submit', (e) => this.handleMortalitySubmit(e));
        document.getElementById('stock-form')?.addEventListener('submit', (e) => this.handleStockSubmit(e));
        document.getElementById('cancel-mortality-form')?.addEventListener('click', () => this.hideMortalityForm());
        document.getElementById('cancel-stock-form')?.addEventListener('click', () => this.hideStockForm());
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-mortality')) {
                const id = parseInt(e.target.closest('.delete-mortality').dataset.id);
                this.deleteMortalityRecord(id);
            }
        });

        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const mortalityDate = document.getElementById('mortality-date');
        const stockDate = document.getElementById('stock-date');
        if (mortalityDate) mortalityDate.value = today;
        if (stockDate) stockDate.value = today;

        // Update quantity max based on current stock
        const quantityInput = document.getElementById('mortality-quantity');
        if (quantityInput) {
            quantityInput.max = this.currentStock;
            quantityInput.addEventListener('input', (e) => {
                if (parseInt(e.target.value) > this.currentStock) {
                    e.target.value = this.currentStock;
                }
            });
        }

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    showMortalityForm() {
        document.getElementById('mortality-form-container').classList.remove('hidden');
        document.getElementById('mortality-form').reset();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('mortality-date').value = today;
        
        // Update max quantity
        const quantityInput = document.getElementById('mortality-quantity');
        if (quantityInput) {
            quantityInput.max = this.currentStock;
            quantityInput.placeholder = `Max: ${this.currentStock} birds`;
        }
        
        document.getElementById('mortality-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideMortalityForm() {
        document.getElementById('mortality-form-container').classList.add('hidden');
    },

    showStockForm() {
        document.getElementById('stock-form-container').classList.remove('hidden');
        document.getElementById('stock-form').reset();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('stock-date').value = today;
        
        document.getElementById('stock-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideStockForm() {
        document.getElementById('stock-form-container').classList.add('hidden');
    },

    handleMortalitySubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('mortality-quantity').value);
        
        if (quantity > this.currentStock) {
            alert(`Cannot record ${quantity} losses. Current stock is only ${this.currentStock} birds.`);
            return;
        }

        const formData = {
            id: Date.now(),
            date: document.getElementById('mortality-date').value,
            quantity: quantity,
            cause: document.getElementById('mortality-cause').value,
            age: parseInt(document.getElementById('mortality-age').value),
            notes: document.getElementById('mortality-notes').value
        };

        // Update current stock
        this.currentStock -= quantity;

        this.mortalityRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        // SYNC WITH SHARED DATA
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Recorded ${quantity} bird loss. Stock updated.`, 'success');
        }
    },

    handleStockSubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('stock-quantity').value);
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('stock-date').value,
            quantity: quantity,
            source: document.getElementById('stock-source').value,
            notes: document.getElementById('stock-notes').value
        };

        // Update current stock
        this.currentStock += quantity;

        this.saveData();
        this.renderModule();
        
        // SYNC WITH SHARED DATA
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Added ${quantity} birds to stock.`, 'success');
        }
    },

    deleteMortalityRecord(id) {
        const record = this.mortalityRecords.find(record => record.id === id);
        if (!record) return;

        if (confirm(`Are you sure you want to delete this mortality record? This will restore ${record.quantity} birds to your stock.`)) {
            // Restore birds to stock
            this.currentStock += record.quantity;
            
            this.mortalityRecords = this.mortalityRecords.filter(record => record.id !== id);
            this.saveData();
            this.renderModule();
            
            // SYNC WITH SHARED DATA
            this.syncStatsWithSharedData();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Mortality record deleted. Stock updated.', 'success');
            }
        }
    },

    generateHealthReport() {
        const stats = this.calculateStats();
        const totalLosses = this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        
        // Calculate causes breakdown
        const causes = {};
        this.mortalityRecords.forEach(record => {
            if (!causes[record.cause]) {
                causes[record.cause] = 0;
            }
            causes[record.cause] += record.quantity;
        });

        let report = `🐔 Broiler Health Report\n\n`;
        report += `Current Stock: ${this.currentStock} birds\n`;
        report += `Total Losses: ${totalLosses} birds\n`;
        report += `Mortality Rate: ${stats.mortalityRate}%\n\n`;
        report += `Losses by Cause:\n`;

        Object.entries(causes).forEach(([cause, count]) => {
            const percentage = ((count / totalLosses) * 100).toFixed(1);
            report += `• ${this.formatCause(cause)}: ${count} birds (${percentage}%)\n`;
        });

        report += `\nRecommendations:\n`;
        if (stats.mortalityRate > 5) {
            report += `⚠️ High mortality - review management practices\n`;
        }
        if (causes['disease'] > 0) {
            report += `🦠 Disease cases detected - consider veterinary consultation\n`;
        }
        if (causes['predator'] > 0) {
            report += `🐺 Predator losses - improve security measures\n`;
        }

        alert(report);
    },

    // NEW METHOD: Sync mortality stats with shared app data
    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        const totalLosses = this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        
        // Update shared app data
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            // Update mortality-related stats in shared data
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.currentStock;
            window.FarmModules.appData.profile.dashboardStats.totalMortality = totalLosses;
            window.FarmModules.appData.profile.dashboardStats.mortalityRate = parseFloat(stats.mortalityRate);
            window.FarmModules.appData.profile.dashboardStats.totalMortalityRecords = this.mortalityRecords.length;
            
            // Calculate weekly mortality for trends
            const weeklyMortality = this.getWeeklyMortality();
            window.FarmModules.appData.profile.dashboardStats.weeklyMortality = weeklyMortality;
            
            console.log('📊 Mortality stats synced with shared data');
        }
    },

    // NEW METHOD: Calculate weekly mortality
    getWeeklyMortality() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return this.mortalityRecords
            .filter(record => new Date(record.date) >= oneWeekAgo)
            .reduce((sum, record) => sum + record.quantity, 0);
    },

    saveData() {
        localStorage.setItem('farm-mortality-records', JSON.stringify(this.mortalityRecords));
        localStorage.setItem('farm-current-stock', this.currentStock.toString());
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
}
