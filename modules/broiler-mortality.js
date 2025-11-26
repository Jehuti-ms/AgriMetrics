// modules/broiler-mortality.js
console.log('Loading broiler-mortality module...');

class BroilerMortalityModule {
    constructor() {
        this.name = 'broiler-mortality';
        this.initialized = false;
        this.mortalityData = [];
        this.container = null;
    }

    async initialize() {
        console.log('🐔 Initializing broiler mortality tracking...');
        await this.loadMortalityData();
        this.render();
        this.initialized = true;
        return true;
    }

    async loadMortalityData() {
        try {
            if (window.db) {
                this.mortalityData = await window.db.getAll('broiler-mortality');
            } else {
                const savedData = localStorage.getItem('farm-broiler-mortality');
                this.mortalityData = savedData ? JSON.parse(savedData) : [];
            }
        } catch (error) {
            console.error('Error loading mortality data:', error);
            this.mortalityData = [];
        }
    }

    async saveMortalityData() {
        try {
            if (window.db) {
                await window.db.clear('broiler-mortality');
                for (const record of this.mortalityData) {
                    await window.db.put('broiler-mortality', record);
                }
            } else {
                localStorage.setItem('farm-broiler-mortality', JSON.stringify(this.mortalityData));
            }
        } catch (error) {
            console.error('Error saving mortality data:', error);
        }
    }

    async addMortalityRecord(recordData) {
        const record = {
            id: `mortality_${Date.now()}`,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            batch: recordData.batch,
            house: recordData.house,
            quantity: parseInt(recordData.quantity),
            cause: recordData.cause,
            age: parseInt(recordData.age),
            notes: recordData.notes || '',
            totalBirds: parseInt(recordData.totalBirds) || 0
        };

        this.mortalityData.unshift(record);
        await this.saveMortalityData();
        await this.updateDisplay();
        this.showToast('Mortality record added!', 'success');
    }

    async deleteRecord(recordId) {
        this.mortalityData = this.mortalityData.filter(record => record.id !== recordId);
        await this.saveMortalityData();
        await this.updateDisplay();
        this.showToast('Record deleted!', 'success');
    }

    calculateStats() {
        const today = new Date().toDateString();
        const todayRecords = this.mortalityData.filter(record => 
            new Date(record.timestamp).toDateString() === today
        );
        
        const totalToday = todayRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalAllTime = this.mortalityData.reduce((sum, record) => sum + record.quantity, 0);
        
        // Calculate mortality rate if we have total birds data
        const recordsWithTotal = this.mortalityData.filter(record => record.totalBirds > 0);
        const avgMortalityRate = recordsWithTotal.length > 0 
            ? (recordsWithTotal.reduce((sum, record) => sum + (record.quantity / record.totalBirds * 100), 0) / recordsWithTotal.length).toFixed(2)
            : 0;

        return {
            today: totalToday,
            allTime: totalAllTime,
            mortalityRate: avgMortalityRate,
            todayRecords: todayRecords.length
        };
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.broiler-mortality-container');
        this.setupEventListeners();
        this.updateDisplay();
    }

    getTemplate() {
        return `
            <div class="broiler-mortality-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Broiler Mortality</h1>
                        <p class="header-subtitle">Track and manage bird mortality</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary" id="add-mortality-btn">
                            <i class="icon">➕</i>
                            Add Record
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon today">📅</div>
                        <div class="stat-content">
                            <div class="stat-value" id="today-mortality">0</div>
                            <div class="stat-label">Today's Loss</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon total">🐔</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-mortality">0</div>
                            <div class="stat-label">Total Loss</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon rate">📊</div>
                        <div class="stat-content">
                            <div class="stat-value" id="mortality-rate">0%</div>
                            <div class="stat-label">Avg. Rate</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon records">📝</div>
                        <div class="stat-content">
                            <div class="stat-value" id="today-records">0</div>
                            <div class="stat-label">Today's Records</div>
                        </div>
                    </div>
                </div>

                <!-- Actions Bar -->
                <div class="actions-bar">
                    <div class="search-box">
                        <i class="icon">🔍</i>
                        <input type="text" id="mortality-search" placeholder="Search records...">
                    </div>
                    <div class="action-buttons">
                        <button class="btn-secondary" id="export-mortality-btn">
                            <i class="icon">📤</i>
                            Export
                        </button>
                        <button class="btn-secondary" id="mortality-report-btn">
                            <i class="icon">📈</i>
                            Report
                        </button>
                    </div>
                </div>

                <!-- Mortality Records Table -->
                <div class="table-container">
                    <div class="table-header">
                        <h3>Recent Mortality Records</h3>
                        <div class="table-actions">
                            <button class="btn-text" id="filter-mortality-btn">
                                <i class="icon">🔧</i>
                                Filter
                            </button>
                        </div>
                    </div>
                    <div class="table-content" id="mortality-table-content">
                        <!-- Records will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    }

    async updateDisplay() {
        if (!this.container) return;

        const stats = this.calculateStats();
        
        // Update stats
        this.updateElement('#today-mortality', stats.today);
        this.updateElement('#total-mortality', stats.allTime);
        this.updateElement('#mortality-rate', `${stats.mortalityRate}%`);
        this.updateElement('#today-records', stats.todayRecords);

        // Update table
        await this.renderMortalityTable();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    async renderMortalityTable() {
        const tableContent = this.container?.querySelector('#mortality-table-content');
        if (!tableContent) return;

        if (this.mortalityData.length === 0) {
            tableContent.innerHTML = this.getEmptyState();
            return;
        }

        tableContent.innerHTML = this.getMortalityTable();
        this.setupTableEventListeners();
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🐔</div>
                <h3>No Mortality Records</h3>
                <p>Start tracking broiler mortality to monitor flock health</p>
                <button class="btn-primary" id="add-first-record-btn">
                    Add First Record
                </button>
            </div>
        `;
    }

    getMortalityTable() {
        const recentRecords = this.mortalityData.slice(0, 20);
        
        return `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Batch</th>
                            <th>House</th>
                            <th class="text-right">Age (days)</th>
                            <th class="text-right">Quantity</th>
                            <th>Cause</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentRecords.map(record => `
                            <tr class="mortality-row" data-record-id="${record.id}">
                                <td>
                                    <div class="date-primary">${record.date}</div>
                                </td>
                                <td class="batch-cell">${record.batch}</td>
                                <td class="house-cell">${record.house}</td>
                                <td class="text-right">${record.age}</td>
                                <td class="text-right">
                                    <div class="quantity ${record.quantity > 10 ? 'high-mortality' : ''}">${record.quantity}</div>
                                </td>
                                <td class="cause-cell">
                                    <span class="cause-tag cause-${record.cause.toLowerCase().replace(' ', '-')}">${record.cause}</span>
                                </td>
                                <td class="text-center">
                                    <div class="action-buttons">
                                        <button class="btn-icon danger delete-record-btn" data-record-id="${record.id}" title="Delete record">
                                            <i class="icon">🗑️</i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners() {
        if (!this.container) return;

        // Add record button
        this.container.querySelector('#add-mortality-btn')?.addEventListener('click', () => {
            this.showAddRecordModal();
        });

        // Add first record button (empty state)
        this.container.querySelector('#add-first-record-btn')?.addEventListener('click', () => {
            this.showAddRecordModal();
        });

        // Export button
        this.container.querySelector('#export-mortality-btn')?.addEventListener('click', () => {
            this.exportMortalityData();
        });

        // Report button
        this.container.querySelector('#mortality-report-btn')?.addEventListener('click', () => {
            this.generateMortalityReport();
        });

        // Search functionality
        const searchInput = this.container.querySelector('#mortality-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterRecords(e.target.value);
            });
        }
    }

    setupTableEventListeners() {
        // Delete record buttons
        this.container?.querySelectorAll('.delete-record-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-record-id');
                this.confirmDeleteRecord(recordId);
            });
        });
    }

    showAddRecordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Mortality Record</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="add-mortality-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="mortality-batch">Batch ID *</label>
                            <input type="text" id="mortality-batch" name="batch" required>
                        </div>
                        <div class="form-group">
                            <label for="mortality-house">House Number *</label>
                            <input type="text" id="mortality-house" name="house" required>
                        </div>
                        <div class="form-group">
                            <label for="mortality-quantity">Quantity *</label>
                            <input type="number" id="mortality-quantity" name="quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="mortality-age">Age (days) *</label>
                            <input type="number" id="mortality-age" name="age" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="mortality-cause">Cause of Death *</label>
                            <select id="mortality-cause" name="cause" required>
                                <option value="">Select cause...</option>
                                <option value="Disease">Disease</option>
                                <option value="Heat Stress">Heat Stress</option>
                                <option value="Predation">Predation</option>
                                <option value="Accident">Accident</option>
                                <option value="Unknown">Unknown</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label for="mortality-notes">Notes</label>
                            <textarea id="mortality-notes" name="notes" rows="3" placeholder="Additional details..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="mortality-total-birds">Total Birds in Batch (optional)</label>
                            <input type="number" id="mortality-total-birds" name="totalBirds" min="0">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Add Record</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal event listeners
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#add-mortality-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const recordData = Object.fromEntries(formData);
            
            await this.addMortalityRecord(recordData);
            closeModal();
        });
    }

    confirmDeleteRecord(recordId) {
        if (confirm('Are you sure you want to delete this mortality record?')) {
            this.deleteRecord(recordId);
        }
    }

    filterRecords(searchTerm) {
        const rows = this.container?.querySelectorAll('.mortality-row');
        if (!rows) return;

        const term = searchTerm.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    async exportMortalityData() {
        if (this.mortalityData.length === 0) {
            this.showToast('No mortality data to export', 'warning');
            return;
        }

        const csvContent = this.convertToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mortality-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Mortality data exported!', 'success');
    }

    convertToCSV() {
        const headers = ['Date', 'Batch', 'House', 'Age', 'Quantity', 'Cause', 'Notes', 'Total Birds'];
        const rows = this.mortalityData.map(record => [
            record.date,
            record.batch,
            record.house,
            record.age,
            record.quantity,
            record.cause,
            record.notes,
            record.totalBirds || ''
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    generateMortalityReport() {
        if (this.mortalityData.length === 0) {
            this.showToast('No mortality data available for report', 'warning');
            return;
        }

        const stats = this.calculateStats();
        const recentRecords = this.mortalityData.slice(0, 10);
        
        const report = `
🐔 Broiler Mortality Report - ${new Date().toLocaleDateString()}

📊 Statistics:
• Today's Loss: ${stats.today} birds
• Total Loss: ${stats.allTime} birds  
• Average Mortality Rate: ${stats.mortalityRate}%
• Records Today: ${stats.todayRecords}

Recent Records:
${recentRecords.map(record => 
    `• ${record.date} - Batch ${record.batch} - ${record.quantity} birds - ${record.cause}`
).join('\n')}
        `.trim();

        alert(report);
        this.showToast('Mortality report generated!', 'success');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    async cleanup() {
        this.initialized = false;
        this.container = null;
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('broiler-mortality', new BroilerMortalityModule());
    console.log('✅ Broiler Mortality module registered');
}
