// modules/record.js - COMPLETE WITH DATA BROADCASTER
console.log('📝 Loading record module...');

const RecordModule = {
    name: 'record',
    initialized: false,
    element: null,
    records: [],
    currentRecordId: null,
    categories: [
        { id: 'expense', name: 'Expense', icon: '💰' },
        { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
        { id: 'observation', name: 'Observation', icon: '👁️' },
        { id: 'health', name: 'Animal Health', icon: '❤️' },
        { id: 'equipment', name: 'Equipment', icon: '⚙️' },
        { id: 'feed', name: 'Feed', icon: '🌾' },
        { id: 'other', name: 'Other', icon: '📋' }
    ],
    broadcaster: null,

    initialize() {
        console.log('📝 Initializing Farm Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Record module connected to Data Broadcaster');
        } else {
            console.log('⚠️ Broadcaster not available, using local methods');
        }

        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastRecordsLoaded();
        }
        
        this.initialized = true;
        
        console.log('✅ Farm Records initialized');
        return true;
    },

    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        this.broadcaster.on('production-created', (data) => {
            console.log('📡 Records received production update:', data);
            this.checkForRecordOpportunity(data, 'production');
        });
        
        this.broadcaster.on('sale-recorded', (data) => {
            console.log('📡 Records received sale record:', data);
            this.checkForRecordOpportunity(data, 'sale');
        });
        
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Records received inventory update:', data);
            this.checkForRecordOpportunity(data, 'inventory');
        });
        
        this.broadcaster.on('order-created', (data) => {
            console.log('📡 Records received order update:', data);
            this.checkForRecordOpportunity(data, 'order');
        });
        
        this.broadcaster.on('expense-detected', (data) => {
            console.log('📡 Records received expense alert:', data);
            this.createAutoRecordFromEvent(data);
        });
        
        this.broadcaster.on('maintenance-needed', (data) => {
            console.log('📡 Records received maintenance alert:', data);
            this.createMaintenanceRecord(data);
        });
        
        this.broadcaster.on('theme-changed', (data) => {
            console.log('📡 Records theme changed:', data);
            if (this.initialized && data.theme) {
                this.onThemeChange(data.theme);
            }
        });
    },

    broadcastRecordsLoaded() {
        if (!this.broadcaster) return;
        
        const stats = this.calculateRecordStats();
        
        this.broadcaster.broadcast('records-loaded', {
            module: 'record',
            timestamp: new Date().toISOString(),
            stats: stats,
            totalRecords: this.records.length,
            categories: this.categories.map(c => c.id)
        });
    },

    broadcastRecordCreated(record) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('record-created', {
            module: 'record',
            timestamp: new Date().toISOString(),
            recordId: record.id,
            category: record.category,
            title: record.title,
            amount: record.amount || 0,
            date: record.date,
            priority: record.priority || 'normal'
        });
        
        if (record.category === 'expense' && record.amount > 0) {
            this.broadcaster.broadcast('expense-recorded', {
                module: 'record',
                timestamp: new Date().toISOString(),
                recordId: record.id,
                amount: record.amount,
                category: record.title,
                description: record.description
            });
        }
        
        if (record.category === 'maintenance') {
            this.broadcaster.broadcast('maintenance-recorded', {
                module: 'record',
                timestamp: new Date().toISOString(),
                recordId: record.id,
                equipment: record.title,
                description: record.description,
                priority: record.priority
            });
        }
    },

    broadcastRecordUpdated(record) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('record-updated', {
            module: 'record',
            timestamp: new Date().toISOString(),
            recordId: record.id,
            category: record.category,
            title: record.title,
            status: record.status || 'active'
        });
    },

    broadcastRecordDeleted(recordId, category, title) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('record-deleted', {
            module: 'record',
            timestamp: new Date().toISOString(),
            recordId: recordId,
            category: category,
            title: title
        });
    },

    broadcastMonthlyStats() {
        if (!this.broadcaster) return;
        
        const monthlyStats = this.calculateMonthlyStats();
        
        this.broadcaster.broadcast('records-monthly-stats', {
            module: 'record',
            timestamp: new Date().toISOString(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            stats: monthlyStats
        });
    },

    checkForRecordOpportunity(data, source) {
        if (!data) return;
        
        if (source === 'production' && data.quality === 'rejects') {
            this.suggestRecordCreation({
                category: 'observation',
                title: `Production Quality Issue: ${data.product}`,
                description: `High reject rate detected in ${data.product} production. Quality: ${data.quality}`,
                priority: 'high'
            });
        }
        
        if (source === 'inventory' && data.lowInventoryItems && data.lowInventoryItems.length > 0) {
            data.lowInventoryItems.forEach(item => {
                if (item.needed > 0) {
                    this.suggestRecordCreation({
                        category: 'feed',
                        title: `Inventory Alert: ${item.product}`,
                        description: `${item.product} inventory critically low (${item.current}/${item.minimum}). Need ${item.needed} more.`,
                        priority: 'high'
                    });
                }
            });
        }
    },

    suggestRecordCreation(suggestion) {
        console.log('💡 Suggesting record creation:', suggestion);
        
        if (!localStorage.getItem('record-suggestions')) {
            localStorage.setItem('record-suggestions', JSON.stringify([]));
        }
        
        const suggestions = JSON.parse(localStorage.getItem('record-suggestions'));
        suggestions.push({
            ...suggestion,
            suggestedAt: new Date().toISOString(),
            source: 'auto-detection'
        });
        
        localStorage.setItem('record-suggestions', JSON.stringify(suggestions));
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('record-suggested', {
                module: 'record',
                timestamp: new Date().toISOString(),
                suggestion: suggestion
            });
        }
        
        this.showNotification(`Record suggestion: ${suggestion.title}`, 'info');
    },

    createAutoRecordFromEvent(eventData) {
        if (!eventData || !eventData.type) return;
        
        const autoRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            category: 'expense',
            title: `Auto: ${eventData.type}`,
            description: `Automatically recorded from ${eventData.source || 'system event'}. ${eventData.description || ''}`,
            amount: eventData.amount || 0,
            priority: eventData.priority || 'normal',
            status: 'active',
            tags: ['auto-recorded', eventData.source || 'system']
        };
        
        this.records.unshift(autoRecord);
        this.saveData();
        this.broadcastRecordCreated(autoRecord);
        console.log('🤖 Auto-record created:', autoRecord);
    },

    createMaintenanceRecord(maintenanceData) {
        if (!maintenanceData) return;
        
        const maintenanceRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            category: 'maintenance',
            title: `Maintenance: ${maintenanceData.equipment || 'Equipment'}`,
            description: maintenanceData.description || 'Maintenance required',
            priority: maintenanceData.priority || 'medium',
            status: 'pending',
            estimatedCost: maintenanceData.estimatedCost || 0,
            tags: ['maintenance', 'scheduled']
        };
        
        this.records.unshift(maintenanceRecord);
        this.saveData();
        this.broadcastRecordCreated(maintenanceRecord);
        console.log('🔧 Maintenance record created:', maintenanceRecord);
    },

    calculateRecordStats() {
        const today = new Date().toISOString().split('T')[0];
        const last30DaysDate = new Date();
        last30DaysDate.setDate(last30DaysDate.getDate() - 30);
        const last30DaysString = last30DaysDate.toISOString().split('T')[0];
        
        const expenseRecords = this.records.filter(record => record.category === 'expense');
        const maintenanceRecords = this.records.filter(record => record.category === 'maintenance');
        const todayRecords = this.records.filter(record => record.date === today);
        const recentRecords = this.records.filter(record => record.date >= last30DaysString);
        
        return {
            totalRecords: this.records.length,
            totalExpenses: expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0),
            totalMaintenance: maintenanceRecords.length,
            todayRecords: todayRecords.length,
            recentRecords: recentRecords.length,
            pendingMaintenance: maintenanceRecords.filter(r => r.status === 'pending').length,
            highPriority: this.records.filter(r => r.priority === 'high').length,
            categories: this.categories.map(cat => ({
                name: cat.name,
                count: this.records.filter(r => r.category === cat.id).length
            }))
        };
    },

    calculateMonthlyStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyData = this.records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && 
                   recordDate.getFullYear() === currentYear;
        });
        
        const categoryStats = {};
        this.categories.forEach(category => {
            const categoryRecords = monthlyData.filter(record => record.category === category.id);
            categoryStats[category.id] = {
                count: categoryRecords.length,
                totalAmount: categoryRecords.reduce((sum, record) => sum + (record.amount || 0), 0),
                pending: categoryRecords.filter(r => r.status === 'pending').length
            };
        });
        
        return {
            month: currentMonth + 1,
            year: currentYear,
            totalRecords: monthlyData.length,
            totalAmount: monthlyData.reduce((sum, record) => sum + (record.amount || 0), 0),
            categories: categoryStats,
            priorities: {
                high: monthlyData.filter(r => r.priority === 'high').length,
                medium: monthlyData.filter(r => r.priority === 'medium').length,
                low: monthlyData.filter(r => r.priority === 'low').length
            }
        };
    },

    loadData() {
        const savedData = localStorage.getItem('farm-records');
        if (savedData) {
            this.records = JSON.parse(savedData);
        } else {
            this.records = this.getDemoData();
            this.saveData();
        }
        console.log('📊 Loaded records:', this.records.length, 'records');
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('records-data-loaded', {
                module: 'record',
                timestamp: new Date().toISOString(),
                recordsCount: this.records.length
            });
        }
    },

    saveData() {
        localStorage.setItem('farm-records', JSON.stringify(this.records));
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('records-data-saved', {
                module: 'record',
                timestamp: new Date().toISOString(),
                recordsCount: this.records.length
            });
        }
    },

    onThemeChange(theme) {
        console.log(`Farm Records updating for theme: ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    getDemoData() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        return [
            {
                id: 1,
                date: today,
                category: 'expense',
                title: 'Chicken Feed Purchase',
                description: 'Purchased 50kg of premium chicken feed from Farm Supplies Inc.',
                amount: 125.50,
                priority: 'medium',
                status: 'completed',
                tags: ['feed', 'purchase', 'chickens']
            },
            {
                id: 2,
                date: yesterdayString,
                category: 'maintenance',
                title: 'Tractor Oil Change',
                description: 'Routine maintenance: Changed engine oil and filter',
                amount: 45.75,
                priority: 'low',
                status: 'completed',
                tags: ['equipment', 'maintenance', 'tractor']
            },
            {
                id: 3,
                date: today,
                category: 'observation',
                title: 'Broiler Weight Check',
                description: 'Weekly weight check: Average 2.1kg per bird, good growth rate',
                amount: 0,
                priority: 'low',
                status: 'active',
                tags: ['observation', 'broilers', 'health']
            },
            {
                id: 4,
                date: yesterdayString,
                category: 'health',
                title: 'Vaccination - Layer Hens',
                description: 'Administered Newcastle disease vaccine to layer flock',
                amount: 85.00,
                priority: 'high',
                status: 'completed',
                tags: ['health', 'vaccination', 'layers']
            }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateRecordStats();

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <h1 class="module-title">Farm Records</h1>
                    <p class="module-subtitle">Track expenses, maintenance, observations, and more</p>
                </div>

                <!-- Record Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-expenses">$${stats.totalExpenses.toFixed(2)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Expenses</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-records">${stats.totalRecords}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Records</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🔧</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="pending-maintenance">${stats.pendingMaintenance}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Pending Maintenance</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📅</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="today-records">${stats.todayRecords}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Today's Records</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-record-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">New Record</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add farm record</span>
                    </button>
                    <button class="quick-action-btn" id="expense-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Expense Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View expense analysis</span>
                    </button>
                    <button class="quick-action-btn" id="maintenance-schedule-btn">
                        <div style="font-size: 32px;">📅</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Maintenance</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View schedule</span>
                    </button>
                    <button class="quick-action-btn" id="export-records-btn">
                        <div style="font-size: 32px;">💾</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Export Data</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Export records</span>
                    </button>
                </div>

                <!-- Quick Record Form -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">⚡ Quick Record Entry</h3>
                    <form id="quick-record-form">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                            <div>
                                <label class="form-label">Category *</label>
                                <select id="quick-category" required class="form-input">
                                    <option value="">Select Category</option>
                                    <option value="expense">💰 Expense</option>
                                    <option value="maintenance">🔧 Maintenance</option>
                                    <option value="observation">👁️ Observation</option>
                                    <option value="health">❤️ Animal Health</option>
                                    <option value="equipment">⚙️ Equipment</option>
                                    <option value="feed">🌾 Feed</option>
                                    <option value="other">📋 Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Title *</label>
                                <input type="text" id="quick-title" placeholder="Record title" required class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Amount</label>
                                <input type="number" id="quick-amount" placeholder="0.00" class="form-input" min="0" step="0.01">
                            </div>
                            <div>
                                <label class="form-label">Priority</label>
                                <select id="quick-priority" class="form-input">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" class="btn-primary" style="height: 42px;">Add Record</button>
                            </div>
                        </div>
                        <div style="margin-top: 12px;">
                            <label class="form-label">Description</label>
                            <textarea id="quick-description" class="form-input" placeholder="Brief description..." rows="2"></textarea>
                        </div>
                    </form>
                </div>

                <!-- Recent Records -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">📋 Recent Records</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="record-filter" class="form-input" style="width: auto;">
                                <option value="all">All Categories</option>
                                <option value="expense">Expenses</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="observation">Observations</option>
                                <option value="health">Animal Health</option>
                                <option value="equipment">Equipment</option>
                                <option value="feed">Feed</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div id="records-table">
                        ${this.renderRecordsTable('all')}
                    </div>
                </div>

                <!-- Category Summary -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">📊 Records by Category</h3>
                    <div id="category-summary">
                        ${this.renderCategorySummary()}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS -->
            <!-- Record Modal -->
            <div id="record-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 700px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="record-modal-title">New Record</h3>
                        <button class="popout-modal-close" id="close-record-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="record-form">
                            <input type="hidden" id="record-id" value="">
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Date *</label>
                                    <input type="date" id="record-date" class="form-input" required>
                                </div>
                                <div>
                                    <label class="form-label">Category *</label>
                                    <select id="record-category" class="form-input" required>
                                        <option value="">Select Category</option>
                                        <option value="expense">💰 Expense</option>
                                        <option value="maintenance">🔧 Maintenance</option>
                                        <option value="observation">👁️ Observation</option>
                                        <option value="health">❤️ Animal Health</option>
                                        <option value="equipment">⚙️ Equipment</option>
                                        <option value="feed">🌾 Feed</option>
                                        <option value="other">📋 Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Title *</label>
                                <input type="text" id="record-title" class="form-input" placeholder="Enter record title" required>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Description</label>
                                <textarea id="record-description" class="form-input" placeholder="Enter detailed description..." rows="3"></textarea>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Amount</label>
                                    <input type="number" id="record-amount" class="form-input" placeholder="0.00" min="0" step="0.01">
                                </div>
                                <div>
                                    <label class="form-label">Priority</label>
                                    <select id="record-priority" class="form-input">
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Status</label>
                                    <select id="record-status" class="form-input">
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed" selected>Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Tags (comma separated)</label>
                                    <input type="text" id="record-tags" class="form-input" placeholder="feed, purchase, chickens">
                                </div>
                            </div>

                            <!-- Linked Items (for future integration) -->
                            <div style="margin-bottom: 16px; display: none;" id="linked-items-section">
                                <label class="form-label">Linked Items</label>
                                <div class="form-input" style="background: var(--glass-bg); padding: 12px; border-radius: 6px;">
                                    <div style="color: var(--text-secondary); font-size: 14px;">No linked items</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                        Future feature: Link to production, sales, or inventory items
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-record">Cancel</button>
                        <button type="button" class="btn-danger" id="delete-record" style="display: none;">Delete</button>
                        <button type="button" class="btn-primary" id="save-record">Save Record</button>
                    </div>
                </div>
            </div>

            <!-- Expense Report Modal -->
            <div id="expense-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Expense Report</h3>
                        <button class="popout-modal-close" id="close-expense-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="expense-report-content">
                            ${this.getExpenseReportContent()}
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-expense-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-expense-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Maintenance Schedule Modal -->
            <div id="maintenance-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Maintenance Schedule</h3>
                        <button class="popout-modal-close" id="close-maintenance-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="maintenance-content">
                            ${this.getMaintenanceContent()}
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-primary" id="close-maintenance-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.updateStats();
        this.setupEventListeners();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('record-date').value = today;
    },

    renderRecordsTable(filter = 'all') {
        let filteredRecords = this.records;
        
        if (filter !== 'all') {
            filteredRecords = this.records.filter(record => record.category === filter);
        }

        if (filteredRecords.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No records found</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">
                        ${filter === 'all' ? 'Add your first record to get started' : `No ${filter} records found`}
                    </div>
                </div>
            `;
        }

        const sortedRecords = filteredRecords.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Category</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Title</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Amount</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Priority</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Status</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedRecords.map(record => {
                            const categoryInfo = this.categories.find(c => c.id === record.category) || { icon: '📋', name: 'Other' };
                            const priorityClass = record.priority === 'high' ? '#ef4444' :
                                                record.priority === 'medium' ? '#f59e0b' : '#22c55e';
                            const statusClass = record.status === 'completed' ? '#22c55e' :
                                                record.status === 'in-progress' ? '#3b82f6' :
                                                record.status === 'pending' ? '#f59e0b' : '#6b7280';
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatDate(record.date)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">${categoryInfo.icon}</span>
                                            <span style="font-weight: 500;">${categoryInfo.name}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="font-weight: 600;">${record.title}</div>
                                        ${record.description ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${record.description.substring(0, 60)}${record.description.length > 60 ? '...' : ''}</div>` : ''}
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        ${record.amount > 0 ? `<div style="font-weight: 600; color: #ef4444;">$${record.amount.toFixed(2)}</div>` : '<div style="color: var(--text-secondary);">-</div>'}
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                            background: ${priorityClass}20; color: ${priorityClass};">
                                            ${record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                                        </span>
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                            background: ${statusClass}20; color: ${statusClass};">
                                            ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn-icon edit-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Edit">✏️</button>
                                            <button class="btn-icon delete-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderCategorySummary() {
        const stats = this.calculateRecordStats();
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                ${stats.categories.map(cat => {
                    const categoryInfo = this.categories.find(c => c.name === cat.name) || { icon: '📋' };
                    const recordsInCategory = this.records.filter(r => {
                        const catInfo = this.categories.find(c => c.name === cat.name);
                        return catInfo && r.category === catInfo.id;
                    });
                    const totalAmount = recordsInCategory.reduce((sum, record) => sum + (record.amount || 0), 0);
                    
                    return `
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 24px;">${categoryInfo.icon}</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${cat.name}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Records:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${cat.count}</span>
                            </div>
                            ${totalAmount > 0 ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="color: var(--text-secondary);">Total Amount:</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">$${totalAmount.toFixed(2)}</span>
                                </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Percentage:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">
                                    ${stats.totalRecords > 0 ? Math.round((cat.count / stats.totalRecords) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getExpenseReportContent() {
        const expenseRecords = this.records.filter(record => record.category === 'expense' && record.amount > 0);
        const totalExpenses = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        const monthlyExpenses = expenseRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
        });
        
        const monthlyTotal = monthlyExpenses.reduce((sum, record) => sum + record.amount, 0);
        
        // Group by tags
        const tagTotals = {};
        expenseRecords.forEach(record => {
            if (record.tags && Array.isArray(record.tags)) {
                record.tags.forEach(tag => {
                    if (tag && tag.trim()) {
                        const cleanTag = tag.trim().toLowerCase();
                        tagTotals[cleanTag] = (tagTotals[cleanTag] || 0) + record.amount;
                    }
                });
            }
        });
        
        // Get top 5 tags
        const topTags = Object.entries(tagTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return `
            <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
                <h1 style="color: var(--text-primary); margin-bottom: 4px;">Farm Expense Report</h1>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Generated on ${this.formatDate(new Date().toISOString().split('T')[0])} | Total Expenses: $${totalExpenses.toFixed(2)}
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="font-size: 32px;">💰</div>
                            <div>
                                <h3 style="color: var(--text-primary); margin: 0; font-size: 18px;">Total Expenses</h3>
                                <div style="font-size: 12px; color: var(--text-secondary);">All Time</div>
                            </div>
                        </div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary); margin-bottom: 8px;">
                            $${totalExpenses.toFixed(2)}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">
                            ${expenseRecords.length} expense records
                        </div>
                    </div>
                    
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="font-size: 32px;">📅</div>
                            <div>
                                <h3 style="color: var(--text-primary); margin: 0; font-size: 18px;">This Month</h3>
                                <div style="font-size: 12px; color: var(--text-secondary);">${new Date().toLocaleString('default', { month: 'long' })} ${thisYear}</div>
                            </div>
                        </div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary); margin-bottom: 8px;">
                            $${monthlyTotal.toFixed(2)}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">
                            ${monthlyExpenses.length} expense records
                        </div>
                    </div>
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📊 Expense Categories</h3>
                <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border); margin-bottom: 32px;">
                    ${topTags.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${topTags.map(([tag, amount]) => {
                                const percentage = (amount / totalExpenses) * 100;
                                return `
                                    <div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span style="color: var(--text-primary); font-weight: 500;">
                                                ${tag.charAt(0).toUpperCase() + tag.slice(1)}
                                            </span>
                                            <span style="color: var(--text-primary); font-weight: 600;">
                                                $${amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style="height: 6px; background: var(--glass-border); border-radius: 3px; overflow: hidden;">
                                            <div style="height: 100%; background: #3b82f6; width: ${percentage}%;"></div>
                                        </div>
                                        <div style="text-align: right; font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                                            ${percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No tagged expenses found</div>'}
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📋 Recent Expense Records</h3>
                <div style="overflow-x: auto; margin-bottom: 32px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Date</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Title</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Amount</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Priority</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenseRecords.slice(0, 10).map(record => {
                                const priorityClass = this.getPriorityColor(record.priority);
                                const statusClass = this.getStatusColor(record.status);
                                
                                return `
                                    <tr style="border-bottom: 1px solid var(--glass-border);">
                                        <td style="padding: 12px; color: var(--text-primary);">${this.formatDate(record.date)}</td>
                                        <td style="padding: 12px; color: var(--text-primary);">
                                            ${record.title}
                                            ${record.description ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${record.description.substring(0, 50)}${record.description.length > 50 ? '...' : ''}</div>` : ''}
                                        </td>
                                        <td style="padding: 12px; color: var(--text-primary); font-weight: 600; color: #ef4444;">
                                            $${record.amount.toFixed(2)}
                                        </td>
                                        <td style="padding: 12px;">
                                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                                background: ${priorityClass}20; color: ${priorityClass};">
                                                ${record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td style="padding: 12px;">
                                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                                background: ${statusClass}20; color: ${statusClass};">
                                                ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    getMaintenanceContent() {
        const maintenanceRecords = this.records.filter(record => record.category === 'maintenance');
        const pendingMaintenance = maintenanceRecords.filter(record => record.status === 'pending');
        const completedMaintenance = maintenanceRecords.filter(record => record.status === 'completed');
        
        return `
            <div style="padding: 20px;">
                <h1 style="color: var(--text-primary); margin-bottom: 4px;">Maintenance Schedule</h1>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Track and manage equipment maintenance
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="font-size: 32px;">🔧</div>
                            <div>
                                <h3 style="color: var(--text-primary); margin: 0; font-size: 18px;">Pending</h3>
                                <div style="font-size: 12px; color: var(--text-secondary);">Requires attention</div>
                            </div>
                        </div>
                        <div style="font-size: 24px; font-weight: bold; color: #ef4444; margin-bottom: 8px;">
                            ${pendingMaintenance.length}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">
                            Maintenance tasks
                        </div>
                    </div>
                    
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="font-size: 32px;">✅</div>
                            <div>
                                <h3 style="color: var(--text-primary); margin: 0; font-size: 18px;">Completed</h3>
                                <div style="font-size: 12px; color: var(--text-secondary);">This year</div>
                            </div>
                        </div>
                        <div style="font-size: 24px; font-weight: bold; color: #22c55e; margin-bottom: 8px;">
                            ${completedMaintenance.length}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">
                            Completed tasks
                        </div>
                    </div>
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">⏰ Pending Maintenance</h3>
                ${pendingMaintenance.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">
                        ${pendingMaintenance.map(record => {
                            const priorityClass = this.getPriorityColor(record.priority);
                            return `
                                <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div style="font-weight: 600; color: var(--text-primary);">${record.title}</div>
                                        <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                            background: ${priorityClass}20; color: ${priorityClass};">
                                            ${record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                                        </span>
                                    </div>
                                    <div style="color: var(--text-secondary); margin-bottom: 8px;">${record.description || 'No description'}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="font-size: 12px; color: var(--text-secondary);">
                                            Due: ${this.formatDate(record.date)}
                                        </div>
                                        ${record.estimatedCost > 0 ? `
                                            <div style="font-size: 14px; color: #ef4444; font-weight: 600;">
                                                Est. Cost: $${record.estimatedCost.toFixed(2)}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<div style="color: var(--text-secondary); text-align: center; padding: 40px; background: var(--glass-bg); border-radius: 12px;">No pending maintenance tasks</div>'}
            </div>
        `;
    },

    setupEventListeners() {
        // Quick form
        document.getElementById('quick-record-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickRecord();
        });

        // Modal buttons
        document.getElementById('add-record-btn')?.addEventListener('click', () => this.showRecordModal());
        document.getElementById('expense-report-btn')?.addEventListener('click', () => this.showExpenseReport());
        document.getElementById('maintenance-schedule-btn')?.addEventListener('click', () => this.showMaintenanceModal());
        document.getElementById('export-records-btn')?.addEventListener('click', () => this.exportRecords());
        
        // Record modal handlers
        document.getElementById('save-record')?.addEventListener('click', () => this.saveRecord());
        document.getElementById('delete-record')?.addEventListener('click', () => this.deleteCurrentRecord());
        document.getElementById('cancel-record')?.addEventListener('click', () => this.hideRecordModal());
        document.getElementById('close-record-modal')?.addEventListener('click', () => this.hideRecordModal());
        
        // Report modal handlers
        document.getElementById('close-expense-report')?.addEventListener('click', () => this.hideExpenseReportModal());
        document.getElementById('close-expense-report-btn')?.addEventListener('click', () => this.hideExpenseReportModal());
        document.getElementById('print-expense-report')?.addEventListener('click', () => this.printExpenseReport());
        
        // Maintenance modal handlers
        document.getElementById('close-maintenance-modal')?.addEventListener('click', () => this.hideMaintenanceModal());
        document.getElementById('close-maintenance-btn')?.addEventListener('click', () => this.hideMaintenanceModal());
        
        // Filter
        document.getElementById('record-filter')?.addEventListener('change', (e) => {
            document.getElementById('records-table').innerHTML = this.renderRecordsTable(e.target.value);
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideRecordModal();
                this.hideExpenseReportModal();
                this.hideMaintenanceModal();
            }
        });

        // Edit/delete record buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-record')) {
                const recordId = e.target.closest('.edit-record').dataset.id;
                this.editRecord(recordId);
            }
            
            if (e.target.closest('.delete-record')) {
                e.preventDefault();
                e.stopPropagation();
                
                const deleteBtn = e.target.closest('.delete-record');
                const recordId = deleteBtn.dataset.id;
                
                if (recordId && !deleteBtn.dataset.processing) {
                    deleteBtn.dataset.processing = 'true';
                    this.deleteRecord(recordId);
                    
                    setTimeout(() => {
                        deleteBtn.dataset.processing = '';
                    }, 1000);
                }
            }
        });
    },

    showRecordModal() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        document.getElementById('record-modal').classList.remove('hidden');
        
        const recordId = document.getElementById('record-id').value;
        
        if (!recordId) {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('record-date').value = today;
            document.getElementById('record-modal-title').textContent = 'New Record';
            document.getElementById('delete-record').style.display = 'none';
            document.getElementById('record-form').reset();
        } else {
            document.getElementById('delete-record').style.display = 'block';
            document.getElementById('record-modal-title').textContent = 'Edit Record';
        }
    },

    hideRecordModal() {
        document.getElementById('record-modal').classList.add('hidden');
        document.getElementById('record-id').value = '';
        document.getElementById('record-form').reset();
    },

    showExpenseReport() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById('expense-report-modal').classList.remove('hidden');
    },

    hideExpenseReportModal() {
        document.getElementById('expense-report-modal').classList.add('hidden');
    },

    showMaintenanceModal() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById('maintenance-modal').classList.remove('hidden');
    },

    hideMaintenanceModal() {
        document.getElementById('maintenance-modal').classList.add('hidden');
    },

    handleQuickRecord() {
        const category = document.getElementById('quick-category').value;
        const title = document.getElementById('quick-title').value.trim();
        const amount = parseFloat(document.getElementById('quick-amount').value) || 0;
        const priority = document.getElementById('quick-priority').value;
        const description = document.getElementById('quick-description').value.trim();

        if (!category || !title) {
            this.showNotification('Please fill in category and title', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        const recordData = {
            id: Date.now(),
            date: today,
            category: category,
            title: title,
            description: description,
            amount: amount,
            priority: priority,
            status: 'completed',
            tags: ['quick-entry']
        };

        this.addRecord(recordData);
        
        document.getElementById('quick-record-form').reset();
        this.showNotification('Record added successfully!', 'success');
    },

    addRecord(recordData) {
        this.records.unshift(recordData);
        this.saveData();
        this.updateStats();
        this.renderModule();
        this.broadcastRecordCreated(recordData);
    },

    saveRecord() {
        const form = document.getElementById('record-form');
        if (!form) {
            console.error('❌ Record form not found');
            return;
        }

        const recordId = document.getElementById('record-id').value;
        const date = document.getElementById('record-date').value;
        const category = document.getElementById('record-category').value;
        const title = document.getElementById('record-title').value.trim();
        const description = document.getElementById('record-description').value.trim();
        const amount = parseFloat(document.getElementById('record-amount').value) || 0;
        const priority = document.getElementById('record-priority').value;
        const status = document.getElementById('record-status').value;
        const tags = document.getElementById('record-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!date || !category || !title) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const recordData = {
            id: recordId ? parseInt(recordId) : Date.now(),
            date: date,
            category: category,
            title: title,
            description: description,
            amount: amount,
            priority: priority,
            status: status,
            tags: tags,
            created: new Date().toISOString()
        };

        if (recordId) {
            const index = this.records.findIndex(record => record.id === parseInt(recordId));
            if (index !== -1) {
                this.records[index] = {
                    ...this.records[index],
                    ...recordData,
                    updated: new Date().toISOString()
                };
                this.showNotification('Record updated!', 'success');
                this.broadcastRecordUpdated(this.records[index]);
            }
        } else {
            this.records.unshift(recordData);
            this.showNotification('Record added!', 'success');
            this.broadcastRecordCreated(recordData);
        }

        this.saveData();
        this.updateStats();
        this.hideRecordModal();
        this.renderModule();
        this.broadcastMonthlyStats();
    },

    editRecord(recordId) {
        const record = this.records.find(r => r.id === parseInt(recordId));
        if (!record) return;

        this.currentRecordId = record.id;
        
        document.getElementById('record-id').value = record.id;
        document.getElementById('record-date').value = record.date;
        document.getElementById('record-category').value = record.category;
        document.getElementById('record-title').value = record.title;
        document.getElementById('record-description').value = record.description || '';
        document.getElementById('record-amount').value = record.amount || '';
        document.getElementById('record-priority').value = record.priority || 'medium';
        document.getElementById('record-status').value = record.status || 'completed';
        document.getElementById('record-tags').value = record.tags ? record.tags.join(', ') : '';
        
        this.showRecordModal();
    },

    deleteCurrentRecord() {
        if (!this.currentRecordId) return;

        if (confirm('Are you sure you want to delete this record?')) {
            this.deleteRecord(this.currentRecordId);
            this.hideRecordModal();
        }
    },

    deleteRecord(recordId) {
        const index = this.records.findIndex(r => r.id === parseInt(recordId));
        if (index !== -1) {
            const deletedRecord = this.records[index];
            this.records.splice(index, 1);
            this.saveData();
            this.updateStats();
            this.renderModule();
            this.showNotification('Record deleted', 'success');
            this.broadcastRecordDeleted(recordId, deletedRecord.category, deletedRecord.title);
            this.broadcastMonthlyStats();
        }
    },

    exportRecords() {
        const dataStr = JSON.stringify(this.records, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `farm-records-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        this.showNotification('Records exported successfully!', 'success');
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('records-exported', {
                module: 'record',
                timestamp: new Date().toISOString(),
                filename: exportFileName,
                recordsCount: this.records.length
            });
        }
    },

    updateStats() {
        const stats = this.calculateRecordStats();
        
        const totalExpensesElement = document.getElementById('total-expenses');
        const totalRecordsElement = document.getElementById('total-records');
        const pendingMaintenanceElement = document.getElementById('pending-maintenance');
        const todayRecordsElement = document.getElementById('today-records');
        
        if (totalExpensesElement) totalExpensesElement.textContent = `$${stats.totalExpenses.toFixed(2)}`;
        if (totalRecordsElement) totalRecordsElement.textContent = stats.totalRecords.toString();
        if (pendingMaintenanceElement) pendingMaintenanceElement.textContent = stats.pendingMaintenance.toString();
        if (todayRecordsElement) todayRecordsElement.textContent = stats.todayRecords.toString();
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('records-stats-updated', {
                module: 'record',
                timestamp: new Date().toISOString(),
                stats: stats
            });
        }
    },

    getLiveRecordStats() {
        const stats = this.calculateRecordStats();
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('records-live-stats', {
                module: 'record',
                timestamp: new Date().toISOString(),
                stats: stats
            });
        }
        
        return stats;
    },

    printExpenseReport() {
        window.print();
    },

    formatDate(dateString) {
        if (!dateString) return 'Invalid Date';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    const [year, month, day] = parts;
                    const parsedDate = new Date(year, month - 1, day);
                    if (!isNaN(parsedDate.getTime())) {
                        return parsedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                }
                return dateString;
            }
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Date formatting error:', error);
            return dateString;
        }
    },

    getPriorityColor(priority) {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#22c55e'
        };
        return colors[priority] || '#6b7280';
    },

    getStatusColor(status) {
        const colors = {
            'completed': '#22c55e',
            'in-progress': '#3b82f6',
            'pending': '#f59e0b',
            'cancelled': '#6b7280'
        };
        return colors[status] || '#6b7280';
    },

    showNotification(message, type = 'info') {
        if (window.App && window.App.showNotification) {
            window.App.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('record', RecordModule);
    console.log('✅ Record module registered with FarmModules');
}

window.RecordModule = RecordModule;
console.log('✅ Record module loaded and ready with Data Broadcaster');

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    const MODULE_NAME = 'record.js';
    const MODULE_OBJECT = RecordModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
