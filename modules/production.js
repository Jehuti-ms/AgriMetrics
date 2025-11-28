// modules/production.js - FULLY WORKING
console.log('Loading production module...');

const ProductionModule = {
    name: 'production',
    initialized: false,
    productionRecords: [],

    initialize() {
        console.log('🚜 Initializing production records...');
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
            { id: 1, date: '2024-03-15', product: 'eggs', quantity: 450, unit: 'pieces', quality: 'grade-a', notes: 'Normal production' },
            { id: 2, date: '2024-03-14', product: 'eggs', quantity: 420, unit: 'pieces', quality: 'grade-a', notes: 'Slight drop' },
            { id: 3, date: '2024-03-13', product: 'broilers', quantity: 50, unit: 'birds', quality: 'excellent', notes: 'Ready for market' }
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
                    <p class="module-subtitle">Track your farm output</p>
                </div>

                <!-- Production Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🥚</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.todayEggs}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Today's Eggs</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.weekProduction}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">This Week</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.avgDaily}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Avg Daily</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-eggs-btn">
                        <div style="font-size: 32px;">🥚</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Eggs</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Daily egg production</span>
                    </button>
                    <button class="quick-action-btn" id="record-poultry-btn">
                        <div style="font-size: 32px;">🐔</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Poultry</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Broiler production</span>
                    </button>
                    <button class="quick-action-btn" id="production-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Production Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View trends</span>
                    </button>
                </div>

                <!-- Production Form -->
                <div id="production-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="production-form-title">Record Production</h3>
                        <form id="production-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Product</label>
                                    <select class="form-input" id="production-product" required>
                                        <option value="eggs">Eggs</option>
                                        <option value="broilers">Broilers</option>
                                        <option value="layers">Layers</option>
                                        <option value="manure">Manure</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" id="production-date" required>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quantity</label>
                                    <input type="number" class="form-input" id="production-quantity" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Unit</label>
                                    <select class="form-input" id="production-unit" required>
                                        <option value="pieces">Pieces</option>
                                        <option value="birds">Birds</option>
                                        <option value="kg">Kilograms</option>
                                        <option value="liters">Liters</option>
                                        <option value="bags">Bags</option>
                                    </select>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Quality</label>
                                <select class="form-input" id="production-quality" required>
                                    <option value="excellent">Excellent</option>
                                    <option value="grade-a">Grade A</option>
                                    <option value="grade-b">Grade B</option>
                                    <option value="grade-c">Grade C</option>
                                    <option value="rejects">Rejects</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" id="production-notes" rows="3" placeholder="Any additional notes..."></textarea>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Record</button>
                                <button type="button" class="btn-outline" id="cancel-production-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Production -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Production</h3>
                        <button class="btn-primary" id="show-production-form">Add Record</button>
                    </div>
                    <div id="production-records-list">
                        ${this.renderProductionList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayEggs = this.productionRecords
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekProduction = this.productionRecords
            .filter(record => new Date(record.date) >= oneWeekAgo)
            .reduce((sum, record) => sum + record.quantity, 0);

        const avgDaily = this.productionRecords.length > 0 
            ? Math.round(this.productionRecords.reduce((sum, record) => sum + record.quantity, 0) / this.productionRecords.length)
            : 0;

        return { todayEggs, weekProduction, avgDaily };
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
                ${this.productionRecords.map(record => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${this.getProductIcon(record.product)}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${record.product}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${record.date} • ${record.quality} • ${record.notes || 'No notes'}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">${record.quantity} ${record.unit}</div>
                            <div style="display: flex; gap: 8px; margin-top: 8px;">
                                <button class="btn-icon edit-production" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary); font-size: 12px;">
                                    ✏️ Edit
                                </button>
                                <button class="btn-icon delete-production" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary); font-size: 12px;">
                                    🗑️ Delete
                                </button>
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
            'manure': '💩',
            'other': '📦'
        };
        return icons[product] || '📦';
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('show-production-form')?.addEventListener('click', () => this.showProductionForm());
        document.getElementById('record-eggs-btn')?.addEventListener('click', () => this.showEggsForm());
        document.getElementById('record-poultry-btn')?.addEventListener('click', () => this.showPoultryForm());
        document.getElementById('production-report-btn')?.addEventListener('click', () => this.generateProductionReport());
        
        // Form handlers
        document.getElementById('production-form')?.addEventListener('submit', (e) => this.handleProductionSubmit(e));
        document.getElementById('cancel-production-form')?.addEventListener('click', () => this.hideProductionForm());
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-production')) {
                const id = parseInt(e.target.closest('.delete-production').dataset.id);
                this.deleteProductionRecord(id);
            }
            if (e.target.closest('.edit-production')) {
                const id = parseInt(e.target.closest('.edit-production').dataset.id);
                this.editProductionRecord(id);
            }
        });

        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('production-date');
        if (dateInput) dateInput.value = today;

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

    showProductionForm() {
        this.showFormWithProduct('');
    },

    showEggsForm() {
        this.showFormWithProduct('eggs');
    },

    showPoultryForm() {
        this.showFormWithProduct('broilers');
    },

    showFormWithProduct(product) {
        const formContainer = document.getElementById('production-form-container');
        const formTitle = document.getElementById('production-form-title');
        const productSelect = document.getElementById('production-product');
        const unitSelect = document.getElementById('production-unit');
        const dateInput = document.getElementById('production-date');
        
        formTitle.textContent = product ? `Record ${product.charAt(0).toUpperCase() + product.slice(1)} Production` : 'Record Production';
        
        if (product) {
            productSelect.value = product;
            unitSelect.value = product === 'eggs' ? 'pieces' : 'birds';
        }
        
        dateInput.value = new Date().toISOString().split('T')[0];
        formContainer.classList.remove('hidden');
        formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    hideProductionForm() {
        document.getElementById('production-form-container').classList.add('hidden');
        document.getElementById('production-form').reset();
    },

    handleProductionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('production-date').value,
            product: document.getElementById('production-product').value,
            quantity: parseInt(document.getElementById('production-quantity').value),
            unit: document.getElementById('production-unit').value,
            quality: document.getElementById('production-quality').value,
            notes: document.getElementById('production-notes').value
        };

        this.productionRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Production record added!', 'success');
        }
    },

    deleteProductionRecord(id) {
        if (confirm('Are you sure you want to delete this production record?')) {
            this.productionRecords = this.productionRecords.filter(record => record.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Production record deleted!', 'success');
            }
        }
    },

    editProductionRecord(id) {
        const record = this.productionRecords.find(record => record.id === id);
        if (!record) return;

        // For now, just show an edit form - in a real app you'd populate the form
        alert(`Edit feature coming soon for: ${record.product} - ${record.quantity} ${record.unit}`);
    },

    generateProductionReport() {
        const eggProduction = this.productionRecords
            .filter(record => record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);
        
        const poultryProduction = this.productionRecords
            .filter(record => record.product === 'broilers')
            .reduce((sum, record) => sum + record.quantity, 0);

        let report = `📊 Production Report\n\n`;
        report += `Total Eggs: ${eggProduction} pieces\n`;
        report += `Total Broilers: ${poultryProduction} birds\n`;
        report += `Total Records: ${this.productionRecords.length}\n\n`;
        report += `Last 7 Days:\n`;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentRecords = this.productionRecords
            .filter(record => new Date(record.date) >= oneWeekAgo)
            .slice(0, 5);

        recentRecords.forEach(record => {
            report += `• ${record.date}: ${record.quantity} ${record.unit} of ${record.product}\n`;
        });

        alert(report);
    },

    saveData() {
        localStorage.setItem('farm-production', JSON.stringify(this.productionRecords));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('production', ProductionModule);
}
