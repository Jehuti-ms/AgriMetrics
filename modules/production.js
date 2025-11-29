// modules/production.js - FULLY WORKING (CORRECTED)
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
        
        // Update profile stats on initial load
        this.updateProfileStats();
        
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
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

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
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.productionRecords.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Records</div>
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
                    <button class="quick-action-btn" id="record-other-btn">
                        <div style="font-size: 32px;">📦</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Other Products</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manure, crops, etc.</span>
                    </button>
                    <button class="quick-action-btn" id="production-report-btn">
                        <div style="font-size: 32px;">📈</div>
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
                                    <label class="form-label">Product Type</label>
                                    <select class="form-input" id="production-product" required>
                                        <option value="eggs">Eggs</option>
                                        <option value="broilers">Broilers</option>
                                        <option value="layers">Layers</option>
                                        <option value="manure">Manure</option>
                                        <option value="crops">Crops</option>
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
                                        <option value="crates">Crates</option>
                                    </select>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Quality/Grade</label>
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
                                <textarea class="form-input" id="production-notes" rows="3" placeholder="Any observations, special conditions, or additional information..."></textarea>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Record</button>
                                <button type="button" class="btn-outline" id="cancel-production-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Production Records -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Production</h3>
                        <button class="btn-primary" id="show-production-form">Add Record</button>
                    </div>
                    <div id="production-records-list">
                        ${this.renderProductionList()}
                    </div>
                </div>

                <!-- Production Trends -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Production Trends</h3>
                    <div id="production-trends">
                        ${this.renderProductionTrends()}
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

        return { 
            todayEggs, 
            weekProduction, 
            avgDaily: this.formatNumber(avgDaily) 
        };
    },

    renderProductionList() {
        if (this.productionRecords.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No production records yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first production to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.productionRecords.slice(0, 8).map(record => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 24px;">${this.getProductIcon(record.product)}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                                    ${record.product} • ${record.quality}
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${record.date} • ${record.notes || 'No notes'}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">
                                ${this.formatNumber(record.quantity)} ${record.unit}
                            </div>
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

    renderProductionTrends() {
        // Group production by product type for the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentProduction = this.productionRecords
            .filter(record => new Date(record.date) >= oneWeekAgo);
        
        const productTotals = {};
        recentProduction.forEach(record => {
            if (!productTotals[record.product]) {
                productTotals[record.product] = 0;
            }
            productTotals[record.product] += record.quantity;
        });

        if (Object.keys(productTotals).length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
                    <div style="font-size: 14px;">No production data for trends</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Add production records to see trends</div>
                </div>
            `;
        }

        const maxTotal = Math.max(...Object.values(productTotals));
        
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${Object.entries(productTotals).map(([product, total]) => {
                    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                    return `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${this.getProductIcon(product)}</div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${product}</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">${this.formatNumber(total)}</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${percentage}%; height: 100%; background: var(--primary-color); border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getProductIcon(product) {
        const icons = {
            'eggs': '🥚',
            'broilers': '🐔',
            'layers': '🐓',
            'manure': '💩',
            'crops': '🌱',
            'other': '📦'
        };
        return icons[product] || '📦';
    },

    setupEventListeners() {
        // Form buttons
        const showFormBtn = document.getElementById('show-production-form');
        const recordEggsBtn = document.getElementById('record-eggs-btn');
        const recordPoultryBtn = document.getElementById('record-poultry-btn');
        const recordOtherBtn = document.getElementById('record-other-btn');
        const reportBtn = document.getElementById('production-report-btn');

        if (showFormBtn) showFormBtn.addEventListener('click', () => this.showProductionForm());
        if (recordEggsBtn) recordEggsBtn.addEventListener('click', () => this.showEggsForm());
        if (recordPoultryBtn) recordPoultryBtn.addEventListener('click', () => this.showPoultryForm());
        if (recordOtherBtn) recordOtherBtn.addEventListener('click', () => this.showOtherForm());
        if (reportBtn) reportBtn.addEventListener('click', () => this.generateProductionReport());
        
        // Form handlers
        const productionForm = document.getElementById('production-form');
        const cancelForm = document.getElementById('cancel-production-form');

        if (productionForm) productionForm.addEventListener('submit', (e) => this.handleProductionSubmit(e));
        if (cancelForm) cancelForm.addEventListener('click', () => this.hideProductionForm());
        
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

        // Auto-set unit based on product selection
        const productSelect = document.getElementById('production-product');
        if (productSelect) {
            productSelect.addEventListener('change', (e) => {
                this.updateUnitForProduct(e.target.value);
            });
        }

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });
        });

        console.log('✅ Production module event listeners setup complete');
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

    showOtherForm() {
        this.showFormWithProduct('other');
    },

    showFormWithProduct(product) {
        const formContainer = document.getElementById('production-form-container');
        const formTitle = document.getElementById('production-form-title');
        const productSelect = document.getElementById('production-product');
        
        if (!formContainer || !formTitle || !productSelect) {
            console.error('Form elements not found');
            return;
        }

        if (product) {
            formTitle.textContent = `Record ${this.formatProductName(product)} Production`;
            productSelect.value = product;
            this.updateUnitForProduct(product);
        } else {
            formTitle.textContent = 'Record Production';
        }
        
        formContainer.classList.remove('hidden');
        formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    updateUnitForProduct(product) {
        const unitSelect = document.getElementById('production-unit');
        if (!unitSelect) return;

        const unitMap = {
            'eggs': 'pieces',
            'broilers': 'birds',
            'layers': 'birds',
            'manure': 'bags',
            'crops': 'kg',
            'other': 'units'
        };

        unitSelect.value = unitMap[product] || 'units';
    },

    hideProductionForm() {
        const formContainer = document.getElementById('production-form-container');
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
        const form = document.getElementById('production-form');
        if (form) {
            form.reset();
        }
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

        // Validate data
        if (!formData.date || !formData.product || formData.quantity <= 0) {
            alert('Please fill in all required fields with valid data.');
            return;
        }

        this.productionRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        // ✅ UPDATE PROFILE STATS AFTER SAVING PRODUCTION RECORD
        this.updateProfileStats();
        
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Production record added successfully!', 'success');
        } else {
            alert('Production record added!');
        }
    },

    deleteProductionRecord(id) {
        if (confirm('Are you sure you want to delete this production record?')) {
            this.productionRecords = this.productionRecords.filter(record => record.id !== id);
            this.saveData();
            this.renderModule();
            
            // ✅ UPDATE PROFILE STATS AFTER DELETING PRODUCTION RECORD
            this.updateProfileStats();
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('Production record deleted!', 'success');
            }
        }
    },

    editProductionRecord(id) {
        const record = this.productionRecords.find(record => record.id === id);
        if (!record) return;

        // For now, show a simple edit form - in a real app you'd populate the existing form
        const newQuantity = prompt(`Edit quantity for ${record.product} (current: ${record.quantity} ${record.unit}):`, record.quantity);
        if (newQuantity !== null && !isNaN(newQuantity)) {
            record.quantity = parseInt(newQuantity);
            this.saveData();
            this.renderModule();
            
            // ✅ UPDATE PROFILE STATS AFTER EDITING PRODUCTION RECORD
            this.updateProfileStats();
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('Production record updated!', 'success');
            }
        }
    },

    // ✅ NEW METHOD: Update Profile Stats
    updateProfileStats() {
        if (window.ProfileModule && window.profileInstance) {
            const productionRecords = this.productionRecords || [];
            
            window.profileInstance.updateStats({
                activeProduction: productionRecords.length
            });
        }
    },

    generateProductionReport() {
        const totalProduction = this.productionRecords.reduce((sum, record) => sum + record.quantity, 0);
        const eggProduction = this.productionRecords
            .filter(record => record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);
        const poultryProduction = this.productionRecords
            .filter(record => record.product === 'broilers' || record.product === 'layers')
            .reduce((sum, record) => sum + record.quantity, 0);

        // Quality breakdown
        const qualityCounts = {};
        this.productionRecords.forEach(record => {
            qualityCounts[record.quality] = (qualityCounts[record.quality] || 0) + record.quantity;
        });

        let report = `📊 PRODUCTION REPORT\n\n`;
        report += `Total Production: ${this.formatNumber(totalProduction)} units\n`;
        report += `Egg Production: ${this.formatNumber(eggProduction)} pieces\n`;
        report += `Poultry Production: ${this.formatNumber(poultryProduction)} birds\n`;
        report += `Total Records: ${this.productionRecords.length}\n\n`;
        
        report += `Quality Breakdown:\n`;
        Object.entries(qualityCounts).forEach(([quality, count]) => {
            const percentage = totalProduction > 0 ? (count / totalProduction) * 100 : 0;
            report += `• ${this.formatQuality(quality)}: ${this.formatNumber(count)} (${percentage.toFixed(1)}%)\n`;
        });

        report += `\nRecent Production (Last 5 records):\n`;
        this.productionRecords.slice(0, 5).forEach(record => {
            report += `• ${record.date}: ${this.formatNumber(record.quantity)} ${record.unit} of ${record.product} (${record.quality})\n`;
        });

        alert(report);
    },

    formatProductName(product) {
        const names = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'manure': 'Manure',
            'crops': 'Crops',
            'other': 'Other'
        };
        return names[product] || product;
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent',
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'grade-c': 'Grade C',
            'rejects': 'Rejects'
        };
        return qualities[quality] || quality;
    },

    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    },

    saveData() {
        localStorage.setItem('farm-production', JSON.stringify(this.productionRecords));
    }
};

// Register the module properly
if (window.FarmModules) {
    window.FarmModules.registerModule('production', ProductionModule);
    console.log('✅ Production module registered successfully');
} else {
    console.error('❌ FarmModules framework not available');
}

// Make it globally available for debugging
window.ProductionModule = ProductionModule;
