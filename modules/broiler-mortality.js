// modules/broiler-mortality.js
console.log('Loading broiler-mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    mortalityData: [],

    initialize() {
        console.log('🐔 Initializing broiler mortality tracking...');
        this.loadMortalityData();
        this.renderMortality();
        this.initialized = true;
        return true;
    },

    loadMortalityData() {
        // Try to load from localStorage
        const savedData = localStorage.getItem('farm-mortality-data');
        if (savedData) {
            this.mortalityData = JSON.parse(savedData);
        }
    },

    saveMortalityData() {
        localStorage.setItem('farm-mortality-data', JSON.stringify(this.mortalityData));
    },

    addMortalityRecord(recordData) {
        const record = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            batch: recordData.batch,
            house: recordData.house,
            quantity: parseInt(recordData.quantity),
            cause: recordData.cause,
            age: parseInt(recordData.age),
            notes: recordData.notes || ''
        };
        
        this.mortalityData.unshift(record);
        this.saveMortalityData();
        this.updateMortalityDisplay();
        this.showNotification('Mortality record added successfully!', 'success');
    },

    deleteMortalityRecord(recordId) {
        this.mortalityData = this.mortalityData.filter(record => record.id !== recordId);
        this.saveMortalityData();
        this.updateMortalityDisplay();
        this.showNotification('Mortality record deleted!', 'success');
    },

    calculateMortalityStats() {
        const totalMortality = this.mortalityData.reduce((sum, record) => sum + record.quantity, 0);
        const today = new Date().toDateString();
        const todayMortality = this.mortalityData.filter(record => 
            new Date(record.date).toDateString() === today
        ).reduce((sum, record) => sum + record.quantity, 0);

        // Calculate by cause
        const causeBreakdown = {};
        this.mortalityData.forEach(record => {
            causeBreakdown[record.cause] = (causeBreakdown[record.cause] || 0) + record.quantity;
        });

        return {
            totalMortality,
            todayMortality,
            totalRecords: this.mortalityData.length,
            causeBreakdown
        };
    },

    updateMortalityDisplay() {
        const stats = this.calculateMortalityStats();
        
        // Update summary cards
        const totalMortalityEl = document.querySelector('.mortality-summary-card:nth-child(1) div:nth-child(3)');
        const todayMortalityEl = document.querySelector('.mortality-summary-card:nth-child(2) div:nth-child(3)');
        const totalRecordsEl = document.querySelector('.mortality-summary-card:nth-child(3) div:nth-child(3)');
        
        if (totalMortalityEl) totalMortalityEl.textContent = stats.totalMortality;
        if (todayMortalityEl) todayMortalityEl.textContent = stats.todayMortality;
        if (totalRecordsEl) totalRecordsEl.textContent = stats.totalRecords;

        // Update recent records table
        this.renderMortalityTable();
    },

    renderMortalityTable() {
        const mortalityContainer = document.querySelector('.mortality-container');
        if (!mortalityContainer) return;

        if (this.mortalityData.length === 0) {
            mortalityContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🐔</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No mortality records yet</div>
                    <div style="font-size: 14px; color: #999;">Record your first mortality incident</div>
                </div>
            `;
            return;
        }

        const recentRecords = this.mortalityData.slice(0, 10);
        
        mortalityContainer.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Date</th>
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Batch</th>
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">House</th>
                            <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #666;">Qty</th>
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Cause</th>
                            <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #666;">Age (days)</th>
                            <th style="text-align: center; padding: 12px 16px; font-weight: 600; color: #666;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentRecords.map(record => `
                            <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                <td style="padding: 12px 16px; color: #666;">${new Date(record.date).toLocaleDateString()}</td>
                                <td style="padding: 12px 16px; font-weight: 500;">${record.batch}</td>
                                <td style="padding: 12px 16px; color: #666;">${record.house}</td>
                                <td style="padding: 12px 16px; text-align: right; color: #666;">${record.quantity}</td>
                                <td style="padding: 12px 16px; color: #666;">${record.cause}</td>
                                <td style="padding: 12px 16px; text-align: right; color: #666;">${record.age}</td>
                                <td style="padding: 12px 16px; text-align: center;">
                                    <button class="delete-mortality-btn" data-record-id="${record.id}" style="
                                        background: rgba(239, 68, 68, 0.1);
                                        border: 1px solid rgba(239, 68, 68, 0.2);
                                        border-radius: 8px;
                                        padding: 6px 12px;
                                        color: #ef4444;
                                        font-size: 12px;
                                        cursor: pointer;
                                        transition: all 0.2s ease;
                                    ">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.setupMortalityTableListeners();
    },

    setupMortalityTableListeners() {
        const deleteButtons = document.querySelectorAll('.delete-mortality-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const recordId = e.target.getAttribute('data-record-id');
                if (confirm('Are you sure you want to delete this mortality record?')) {
                    this.deleteMortalityRecord(recordId);
                }
            });
        });
    },

    showAddMortalityModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 30px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Add Mortality Record</h3>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>

                <form id="add-mortality-form">
                    <div style="display: grid; gap: 16px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Batch ID *</label>
                            <input type="text" name="batch" required style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            " placeholder="Enter batch ID">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">House Number *</label>
                            <input type="text" name="house" required style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            " placeholder="Enter house number">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Quantity *</label>
                                <input type="number" name="quantity" min="1" required style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                " placeholder="0">
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Age (days) *</label>
                                <input type="number" name="age" min="1" required style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                " placeholder="0">
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Cause of Death *</label>
                            <select name="cause" required style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                                <option value="">Select cause...</option>
                                <option value="Disease">Disease</option>
                                <option value="Heat Stress">Heat Stress</option>
                                <option value="Predation">Predation</option>
                                <option value="Accident">Accident</option>
                                <option value="Unknown">Unknown</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Notes</label>
                            <textarea name="notes" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                                resize: vertical;
                                min-height: 80px;
                            " placeholder="Additional details..."></textarea>
                        </div>

                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="submit" style="
                                flex: 1;
                                background: #10b981;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px 24px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            ">Add Record</button>
                            <button type="button" class="cancel-modal" style="
                                flex: 1;
                                background: #6b7280;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px 24px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            ">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners for modal
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.cancel-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#add-mortality-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const recordData = {
                batch: formData.get('batch'),
                house: formData.get('house'),
                quantity: formData.get('quantity'),
                age: formData.get('age'),
                cause: formData.get('cause'),
                notes: formData.get('notes')
            };
            
            this.addMortalityRecord(recordData);
            closeModal();
        });
    },

    renderMortality() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Broiler Mortality</h1>
                    <p style="color: #666; font-size: 16px;">Track and manage bird mortality records</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="add-mortality" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">🐔</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Add Record</div>
                                <div style="font-size: 12px; color: #666;">Record mortality incident</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="mortality-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">📊</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Mortality Report</div>
                                <div style="font-size: 12px; color: #666;">Generate report</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Mortality Summary -->
                <div class="mortality-summary" style="margin-bottom: 30px;">
                    <div class="summary-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <div class="mortality-summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">🐔</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Mortality</div>
                            <div style="font-size: 28px; font-weight: bold; color: #ef4444;">0</div>
                        </div>

                        <div class="mortality-summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #f59e0b; margin-bottom: 12px;">📅</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Today's Mortality</div>
                            <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">0</div>
                        </div>

                        <div class="mortality-summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #3b82f6; margin-bottom: 12px;">📝</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Records</div>
                            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">0</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Mortality Records -->
                <div class="recent-mortality">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px;">Recent Mortality Records</h2>
                        <button style="
                            background: rgba(59, 130, 246, 0.1);
                            border: 1px solid rgba(59, 130, 246, 0.2);
                            border-radius: 12px;
                            padding: 10px 16px;
                            color: #3b82f6;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                        ">View All</button>
                    </div>
                    
                    <div class="mortality-container" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div style="text-align: center; color: #666; padding: 40px 20px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">🐔</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No mortality records yet</div>
                            <div style="font-size: 14px; color: #999;">Record your first mortality incident</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupMortalityEventListeners();
        this.updateMortalityDisplay();
    },

    setupMortalityEventListeners() {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });

            // Add click handlers for action buttons
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                switch (action) {
                    case 'add-mortality':
                        this.showAddMortalityModal();
                        break;
                    case 'mortality-report':
                        this.generateMortalityReport();
                        break;
                }
            });
        });
    },

    generateMortalityReport() {
        if (this.mortalityData.length === 0) {
            this.showNotification('No mortality data available for report', 'info');
            return;
        }

        const stats = this.calculateMortalityStats();
        const report = `
Broiler Mortality Report - ${new Date().toLocaleDateString()}

Total Mortality: ${stats.totalMortality} birds
Today's Mortality: ${stats.todayMortality} birds
Total Records: ${stats.totalRecords}

Cause Breakdown:
${Object.entries(stats.causeBreakdown).map(([cause, count]) => 
    `• ${cause}: ${count} birds`
).join('\n')}

Recent Records:
${this.mortalityData.slice(0, 10).map(record => 
    `${new Date(record.date).toLocaleDateString()} - Batch ${record.batch} - ${record.quantity} birds - ${record.cause}`
).join('\n')}
        `;

        alert(report);
        this.showNotification('Mortality report generated!', 'success');
    },

    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
    console.log('✅ Broiler Mortality module registered');
}
