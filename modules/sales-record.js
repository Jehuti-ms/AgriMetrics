/**
 * Sales Record Module - Complete Fix
 * Version: 2.0.0
 * Date: 2024-01-21
 * 
 * Features:
 * - CSP Compliant (no inline event handlers)
 * - Data Broadcaster Integration
 * - Production Module Integration
 * - Weight-based Meat Sales
 * - Comprehensive Reporting
 * - Error Handling
 */

console.log('💰 Loading Sales Record Module v2.0...');

const SalesRecordModule = {
    name: 'sales-record',
    version: '2.0.0',
    initialized: false,
    element: null,
    currentSaleId: null,
    broadcaster: null,
    pendingProductionSale: null,

    // ==================== INITIALIZATION ====================
    
    initialize() {
        console.log('🔄 Initializing Sales Record Module...');
        
        if (!this.checkDependencies()) {
            console.error('❌ Missing dependencies');
            return false;
        }
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }
        
        // Connect to broadcaster
        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Connected to Data Broadcaster');
        }
        
        // Load data
        this.loadData();
        
        // Setup everything
        this.setupEventDelegation();
        this.render();
        this.setupBroadcasterListeners();
        
        this.initialized = true;
        console.log('✅ Sales Record Module initialized');
        
        // Broadcast module ready
        this.broadcast('sales-module-ready', {
            version: this.version,
            salesCount: this.getSales().length
        });
        
        return true;
    },

    checkDependencies() {
        const required = ['FarmModules', 'DateUtils'];
        const missing = required.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            console.error(`❌ Missing dependencies: ${missing.join(', ')}`);
            return false;
        }
        
        // Initialize data structure if needed
        if (!window.FarmModules.appData) {
            window.FarmModules.appData = {};
        }
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        
        return true;
    },

    loadData() {
        try {
            const saved = localStorage.getItem('farm_sales');
            if (saved) {
                window.FarmModules.appData.sales = JSON.parse(saved);
                console.log(`📊 Loaded ${window.FarmModules.appData.sales.length} sales records`);
            }
        } catch (error) {
            console.error('❌ Error loading sales data:', error);
            window.FarmModules.appData.sales = [];
        }
    },

    saveData() {
        try {
            localStorage.setItem('farm_sales', JSON.stringify(window.FarmModules.appData.sales));
            
            // Broadcast data saved
            this.broadcast('sales-data-saved', {
                count: window.FarmModules.appData.sales.length,
                timestamp: new Date().toISOString()
            });
            
            // Update dashboard stats
            this.broadcastSalesStats();
            
            return true;
        } catch (error) {
            console.error('❌ Error saving sales data:', error);
            return false;
        }
    },

    // ==================== BROADCASTER METHODS ====================

    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        // Listen for order completions
        this.broadcaster.on('order-completed', (data) => {
            console.log('📦 Converting order to sale:', data);
            this.convertOrderToSale(data);
        });
        
        // Listen for production updates
        this.broadcaster.on('production-updated', (data) => {
            console.log('🏭 Production updated:', data);
            this.handleProductionUpdate(data);
        });
        
        // Listen for inventory updates
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📦 Inventory updated:', data);
            this.checkInventoryForSales(data);
        });
    },

    broadcast(event, data) {
        if (!this.broadcaster) return;
        
        const eventData = {
            module: this.name,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        this.broadcaster.broadcast(event, eventData);
    },

    broadcastSaleRecorded(sale) {
        const eventData = {
            saleId: sale.id,
            product: sale.product,
            quantity: sale.quantity,
            weight: sale.weight,
            totalAmount: sale.totalAmount,
            customer: sale.customer,
            date: sale.date
        };
        
        // Broadcast to multiple channels
        this.broadcast('sale-recorded', eventData);
        this.broadcast('income-updated', { amount: sale.totalAmount, type: 'sales' });
        
        // Broadcast meat-specific events
        if (this.isMeatProduct(sale.product)) {
            this.broadcast('meat-sold', {
                product: sale.product,
                weight: sale.weight,
                animals: sale.animalCount,
                amount: sale.totalAmount
            });
        }
    },

    broadcastSalesStats() {
        const stats = this.calculateStats();
        this.broadcast('sales-stats', stats);
    },


    // ==================== RENDERING ====================

    render() {
        if (!this.element) return;
        
        const stats = this.calculateStats();
        const today = this.getCurrentDate();
        
        this.element.innerHTML = `
            <div class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-title">
                        <h1><span class="emoji">💰</span> Sales Records</h1>
                        <p class="subtitle">Track sales, revenue, and production integration</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="btn-new-sale">
                            <span class="emoji">➕</span> Record Sale
                        </button>
                        <button class="btn btn-secondary" id="btn-from-production">
                            <span class="emoji">🏭</span> Sell from Production
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    ${this.renderStatsCard('Today\'s Revenue', stats.todayRevenue, '💰', 'revenue')}
                    ${this.renderStatsCard('Total Sales', stats.totalSales, '📊', 'sales')}
                    ${this.renderStatsCard('Meat Weight Sold', stats.meatWeight + ' kg', '🍗', 'meat')}
                    ${this.renderStatsCard('Animals Sold', stats.animalsSold, '🐄', 'animals')}
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h3><span class="emoji">⚡</span> Quick Actions</h3>
                    <div class="action-grid">
                        <button class="action-card" data-action="quick-sale">
                            <span class="emoji large">💰</span>
                            <span class="action-title">Quick Sale</span>
                            <span class="action-desc">Fast transaction</span>
                        </button>
                        <button class="action-card" data-action="meat-sale">
                            <span class="emoji large">🍗</span>
                            <span class="action-title">Meat Sale</span>
                            <span class="action-desc">Weight-based sale</span>
                        </button>
                        <button class="action-card" data-action="production-sale">
                            <span class="emoji large">🏭</span>
                            <span class="action-title">From Production</span>
                            <span class="action-desc">Sell produced items</span>
                        </button>
                        <button class="action-card" data-action="generate-report">
                            <span class="emoji large">📈</span>
                            <span class="action-title">Daily Report</span>
                            <span class="action-desc">Today\'s summary</span>
                        </button>
                    </div>
                </div>

                <!-- Production Integration -->
                <div class="production-section glass-card">
                    <div class="section-header">
                        <h3><span class="emoji">🔄</span> Production Integration</h3>
                        <p>Sell items directly from production records</p>
                    </div>
                    ${this.renderProductionItems()}
                </div>

                <!-- Recent Sales -->
                <div class="sales-section">
                    <div class="section-header">
                        <h3><span class="emoji">📋</span> Recent Sales</h3>
                        <div class="filter-controls">
                            <select id="filter-period" class="form-select">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                    ${this.renderSalesTable('today')}
                </div>
            </div>

            <!-- Modals -->
            ${this.renderSaleModal()}
            ${this.renderProductionModal()}
            ${this.renderReportModal()}
        `;
        
        // Initialize any dynamic components
        this.initializeDatePicker();
    },

    renderStatsCard(title, value, emoji, type) {
        return `
            <div class="stat-card stat-${type}">
                <div class="stat-icon">${emoji}</div>
                <div class="stat-value">${value}</div>
                <div class="stat-title">${title}</div>
            </div>
        `;
    },

    renderProductionItems() {
        const productionData = JSON.parse(localStorage.getItem('farm_production') || '[]');
        const availableItems = this.getAvailableProductionItems(productionData);
        
        if (availableItems.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🏭</div>
                    <h4>No Production Items Available</h4>
                    <p>Add production records to sell them here</p>
                    <button class="btn btn-secondary" data-action="go-to-production">
                        Go to Production Module
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="production-items-grid">
                ${availableItems.slice(0, 4).map(item => `
                    <div class="production-item-card" data-item-id="${item.id}">
                        <div class="item-header">
                            <span class="item-emoji">${this.getProductIcon(item.product)}</span>
                            <span class="item-name">${this.formatProductName(item.product)}</span>
                        </div>
                        <div class="item-details">
                            <div class="detail">
                                <span class="label">Available:</span>
                                <span class="value">${item.availableQuantity} ${item.unit}</span>
                            </div>
                            <div class="detail">
                                <span class="label">Date:</span>
                                <span class="value">${this.formatDate(item.date)}</span>
                            </div>
                        </div>
                        <button class="btn btn-small btn-primary" data-action="sell-item" data-item-id="${item.id}">
                            Sell
                        </button>
                    </div>
                `).join('')}
            </div>
            ${availableItems.length > 4 ? `
                <div class="view-more">
                    <button class="btn btn-link" data-action="view-all-production">
                        View all ${availableItems.length} items →
                    </button>
                </div>
            ` : ''}
        `;
    },

    // ==================== FIXED PRODUCTION METHODS ====================

showProductionModal() {
    console.log('🏭 Showing production items modal...');
    
    // Get production data from localStorage
    const productionData = JSON.parse(localStorage.getItem('farm_production') || '[]');
    const availableItems = this.getAvailableProductionItems(productionData);
    
    // Create modal content
    const modalContent = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3><span class="emoji">🏭</span> Available Production Items</h3>
                <button class="modal-close" data-action="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${availableItems.length === 0 ? `
                    <div class="empty-state">
                        <div class="emoji large">📦</div>
                        <h4>No Production Items Available</h4>
                        <p>Add production records to sell them here</p>
                        <button class="btn btn-primary" data-action="go-to-production">
                            <span class="emoji">🏭</span> Go to Production Module
                        </button>
                    </div>
                ` : `
                    <div class="production-items-grid">
                        ${availableItems.map(item => `
                            <div class="production-item-card" data-item-id="${item.id}">
                                <div class="item-header">
                                    <span class="item-emoji">${this.getProductIcon(item.product)}</span>
                                    <span class="item-name">${this.formatProductName(item.product)}</span>
                                </div>
                                <div class="item-details">
                                    <div class="detail">
                                        <span class="label">Total Produced:</span>
                                        <span class="value">${item.quantity} ${item.unit}</span>
                                    </div>
                                    <div class="detail">
                                        <span class="label">Available:</span>
                                        <span class="value">${item.availableQuantity} ${item.unit}</span>
                                    </div>
                                    <div class="detail">
                                        <span class="label">Produced On:</span>
                                        <span class="value">${this.formatDate(item.date)}</span>
                                    </div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-primary" data-action="sell-production-item" data-item-id="${item.id}">
                                        <span class="emoji">💰</span> Sell This Item
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">Close</button>
                ${availableItems.length > 0 ? `
                    <button class="btn btn-primary" data-action="new-production-sale">
                        <span class="emoji">➕</span> New Production Sale
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Create and show modal
    this.showCustomModal(modalContent, 'production-modal');
},

showCustomModal(content, modalId = 'custom-modal') {
    // Remove existing modal if any
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create new modal
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal active';
    modal.innerHTML = content;
    
    // Add to page
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.hideModal(modalId);
        }
    });
},

// ==================== MISSING NAVIGATION FUNCTIONS ====================

navigateToProduction() {
    console.log('🔄 Navigating to Production module...');
    
    // Multiple navigation strategies
    const strategies = [
        // Strategy 1: Use FarmModules.showModule if available
        () => {
            if (window.FarmModules && window.FarmModules.showModule) {
                window.FarmModules.showModule('production');
                return true;
            }
            return false;
        },
        
        // Strategy 2: Check if Production module exists directly
        () => {
            if (window.FarmModules && window.FarmModules.Production) {
                const contentArea = document.getElementById('content-area');
                if (contentArea) {
                    contentArea.innerHTML = '';
                    if (typeof window.FarmModules.Production.initialize === 'function') {
                        window.FarmModules.Production.initialize();
                    } else if (typeof window.FarmModules.Production.render === 'function') {
                        window.FarmModules.Production.render();
                    }
                    return true;
                }
            }
            return false;
        },
        
        // Strategy 3: Use modules Map
        () => {
            if (window.FarmModules && window.FarmModules.modules) {
                const module = window.FarmModules.modules.get('production') || 
                               window.FarmModules.modules.get('Production');
                if (module) {
                    const contentArea = document.getElementById('content-area');
                    if (contentArea) {
                        contentArea.innerHTML = '';
                        if (typeof module.initialize === 'function') {
                            module.initialize();
                        } else if (typeof module.render === 'function') {
                            module.render();
                        }
                        return true;
                    }
                }
            }
            return false;
        },
        
        // Strategy 4: URL hash
        () => {
            window.location.hash = '#production';
            setTimeout(() => {
                if (window.location.hash === '#production') {
                    window.location.reload();
                    return true;
                }
                return false;
            }, 100);
            return true;
        },
        
        // Strategy 5: Show notification
        () => {
            this.showNotification('Please select "Production" from the sidebar menu', 'info');
            return false;
        }
    ];
    
    // Try each strategy until one works
    for (let strategy of strategies) {
        try {
            if (strategy()) {
                console.log('✅ Navigation successful');
                break;
            }
        } catch (error) {
            console.error('Navigation strategy failed:', error);
            continue;
        }
    }
},

// ==================== MISSING RENDER FUNCTIONS ====================

renderProductOptions() {
    const products = {
        'Livestock (Meat)': [
            { value: 'broilers-dressed', label: 'Broilers (Dressed)', emoji: '🍗' },
            { value: 'pork', label: 'Pork', emoji: '🐖' },
            { value: 'beef', label: 'Beef', emoji: '🐄' },
            { value: 'chicken-parts', label: 'Chicken Parts', emoji: '🍗' },
            { value: 'goat', label: 'Goat', emoji: '🐐' },
            { value: 'lamb', label: 'Lamb', emoji: '🐑' }
        ],
        'Poultry': [
            { value: 'broilers-live', label: 'Broilers (Live)', emoji: '🐔' },
            { value: 'layers', label: 'Layers', emoji: '🐓' },
            { value: 'chicks', label: 'Baby Chicks', emoji: '🐤' }
        ],
        'Eggs & Dairy': [
            { value: 'eggs', label: 'Eggs', emoji: '🥚' },
            { value: 'milk', label: 'Milk', emoji: '🥛' },
            { value: 'cheese', label: 'Cheese', emoji: '🧀' },
            { value: 'yogurt', label: 'Yogurt', emoji: '🥛' }
        ],
        'Produce': [
            { value: 'tomatoes', label: 'Tomatoes', emoji: '🍅' },
            { value: 'peppers', label: 'Peppers', emoji: '🌶️' },
            { value: 'cucumbers', label: 'Cucumbers', emoji: '🥒' },
            { value: 'lettuce', label: 'Lettuce', emoji: '🥬' }
        ]
    };
    
    let html = '';
    
    for (const [category, items] of Object.entries(products)) {
        html += `<optgroup label="${category}">`;
        items.forEach(item => {
            html += `<option value="${item.value}">${item.emoji} ${item.label}</option>`;
        });
        html += '</optgroup>';
    }
    
    html += `<optgroup label="Other">
                <option value="honey">🍯 Honey</option>
                <option value="bread">🍞 Bread</option>
                <option value="other">📦 Other</option>
            </optgroup>`;
    
    return html;
},

renderUnitOptions() {
    const units = [
        { value: 'kg', label: 'Kilograms (kg)', category: 'weight' },
        { value: 'lbs', label: 'Pounds (lbs)', category: 'weight' },
        { value: 'birds', label: 'Birds', category: 'count' },
        { value: 'animals', label: 'Animals', category: 'count' },
        { value: 'dozen', label: 'Dozen', category: 'count' },
        { value: 'pieces', label: 'Pieces', category: 'count' },
        { value: 'liters', label: 'Liters', category: 'volume' },
        { value: 'cases', label: 'Cases', category: 'count' },
        { value: 'crates', label: 'Crates', category: 'count' }
    ];
    
    let html = '';
    
    const grouped = {};
    units.forEach(unit => {
        if (!grouped[unit.category]) grouped[unit.category] = [];
        grouped[unit.category].push(unit);
    });
    
    for (const [category, categoryUnits] of Object.entries(grouped)) {
        html += `<optgroup label="${category.charAt(0).toUpperCase() + category.slice(1)}">`;
        categoryUnits.forEach(unit => {
            html += `<option value="${unit.value}">${unit.label}</option>`;
        });
        html += '</optgroup>';
    }
    
    return html;
},

renderProductionModal() {
    return `
        <div class="modal" id="production-modal">
            <!-- Content will be dynamically generated -->
        </div>
    `;
},

renderReportModal() {
    return `
        <div class="modal" id="report-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><span class="emoji">📊</span> Sales Report</h3>
                    <button class="modal-close" data-action="close-modal">&times;</button>
                </div>
                <div class="modal-body" id="report-content">
                    <!-- Report content will be inserted here -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">Close</button>
                    <button class="btn btn-primary" data-action="print-report">🖨️ Print</button>
                </div>
            </div>
        </div>
    `;
},

// ==================== MISSING REPORT FUNCTIONS ====================

generateDailyReport() {
    const today = this.getCurrentDate();
    const sales = this.getFilteredSales('today');
    
    if (sales.length === 0) {
        this.showNotification('No sales recorded today', 'info');
        return;
    }
    
    const report = this.generateReportHTML('Today\'s Sales Report', today, sales);
    this.showReport(report);
},

generateReportHTML(title, date, sales) {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const avgSale = sales.length > 0 ? totalRevenue / sales.length : 0;
    
    // Group by product
    const productSummary = {};
    sales.forEach(sale => {
        const product = this.formatProductName(sale.product);
        if (!productSummary[product]) {
            productSummary[product] = {
                quantity: 0,
                revenue: 0,
                count: 0
            };
        }
        productSummary[product].quantity += sale.quantity;
        productSummary[product].revenue += sale.totalAmount;
        productSummary[product].count++;
    });
    
    // Group by payment method
    const paymentSummary = {};
    sales.forEach(sale => {
        const method = sale.paymentMethod || 'cash';
        if (!paymentSummary[method]) {
            paymentSummary[method] = {
                count: 0,
                revenue: 0
            };
        }
        paymentSummary[method].count++;
        paymentSummary[method].revenue += sale.totalAmount;
    });
    
    return `
        <div class="report">
            <div class="report-header">
                <h2>${title}</h2>
                <div class="report-date">${this.formatDate(date)}</div>
            </div>
            
            <div class="report-summary">
                <div class="summary-card">
                    <div class="summary-value">${sales.length}</div>
                    <div class="summary-label">Total Sales</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${this.formatCurrency(totalRevenue)}</div>
                    <div class="summary-label">Total Revenue</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${this.formatCurrency(avgSale)}</div>
                    <div class="summary-label">Average Sale</div>
                </div>
            </div>
            
            <div class="report-section">
                <h3>📦 Products Sold</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Revenue</th>
                            <th>Avg Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(productSummary).map(([product, data]) => `
                            <tr>
                                <td>${product}</td>
                                <td>${data.quantity}</td>
                                <td>${this.formatCurrency(data.revenue)}</td>
                                <td>${this.formatCurrency(data.revenue / data.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h3>💳 Payment Methods</h3>
                <div class="payment-grid">
                    ${Object.entries(paymentSummary).map(([method, data]) => `
                        <div class="payment-card">
                            <div class="payment-method">${method.toUpperCase()}</div>
                            <div class="payment-count">${data.count} sales</div>
                            <div class="payment-revenue">${this.formatCurrency(data.revenue)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
},

showReport(content) {
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
        reportContent.innerHTML = content;
    }
    
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.add('active');
    }
},

// ==================== MISSING QUICK SALE FUNCTIONS ====================

showQuickSaleForm() {
    const form = document.createElement('form');
    form.className = 'quick-sale-form';
    form.innerHTML = `
        <div class="form-header">
            <h4><span class="emoji">⚡</span> Quick Sale</h4>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Product</label>
                <select class="form-input" id="quick-product">
                    <option value="broilers-dressed">🍗 Broilers</option>
                    <option value="eggs">🥚 Eggs</option>
                    <option value="milk">🥛 Milk</option>
                    <option value="tomatoes">🍅 Tomatoes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="form-input" id="quick-quantity" value="1" min="1">
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="number" class="form-input" id="quick-price" step="0.01" min="0">
            </div>
        </div>
        <div class="form-group">
            <label>Customer (optional)</label>
            <input type="text" class="form-input" id="quick-customer" placeholder="Customer name">
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" data-action="cancel-quick-sale">Cancel</button>
            <button type="submit" class="btn btn-primary">Record Sale</button>
        </div>
    `;
    
    // Show as modal or inline
    this.showCustomModal(form.outerHTML, 'quick-sale-modal');
    
    // Set default price
    const productSelect = document.getElementById('quick-product');
    if (productSelect) {
        productSelect.addEventListener('change', (e) => {
            this.setQuickDefaultPrice(e.target.value);
        });
        this.setQuickDefaultPrice(productSelect.value);
    }
    
    // Handle form submission
    const modal = document.getElementById('quick-sale-modal');
    if (modal) {
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processQuickSale();
        });
    }
},

setQuickDefaultPrice(product) {
    const prices = {
        'broilers-dressed': 5.50,
        'eggs': 3.25,
        'milk': 2.50,
        'tomatoes': 1.75
    };
    
    const priceInput = document.getElementById('quick-price');
    if (priceInput && prices[product]) {
        priceInput.value = prices[product];
    }
},

processQuickSale() {
    const product = document.getElementById('quick-product')?.value;
    const quantity = parseFloat(document.getElementById('quick-quantity')?.value) || 0;
    const price = parseFloat(document.getElementById('quick-price')?.value) || 0;
    const customer = document.getElementById('quick-customer')?.value;
    
    if (!product || quantity <= 0 || price <= 0) {
        this.showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const sale = {
        id: 'QS-' + Date.now(),
        date: this.getCurrentDate(),
        product: product,
        quantity: quantity,
        unit: 'units',
        unitPrice: price,
        totalAmount: quantity * price,
        customer: customer || 'Walk-in',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
    };
    
    this.addSale(sale);
    this.hideModal('quick-sale-modal');
    this.render();
    this.saveData();
    this.showNotification('Quick sale recorded!', 'success');
},

// ==================== MISSING EVENT HANDLERS ====================

handleProductionUpdate(data) {
    console.log('🔄 Handling production update:', data);
    
    // Re-render production section if visible
    const productionSection = document.querySelector('.production-section');
    if (productionSection) {
        const newContent = this.renderProductionItems();
        const itemsGrid = productionSection.querySelector('.production-items-grid');
        if (itemsGrid) {
            itemsGrid.innerHTML = newContent;
        }
    }
},

convertOrderToSale(orderData) {
    console.log('📦 Converting order to sale:', orderData);
    
    const sale = {
        id: 'ORDER-' + orderData.id,
        date: this.getCurrentDate(),
        product: this.mapOrderProduct(orderData.items),
        quantity: this.calculateOrderQuantity(orderData.items),
        unit: 'items',
        unitPrice: this.calculateAveragePrice(orderData),
        totalAmount: orderData.totalAmount,
        customer: orderData.customerName || 'Order Customer',
        paymentMethod: 'order',
        paymentStatus: 'paid',
        notes: `Converted from order #${orderData.id}`,
        orderSource: true,
        orderId: orderData.id,
        createdAt: new Date().toISOString()
    };
    
    this.addSale(sale);
    this.render();
    this.saveData();
    this.showNotification(`Order #${orderData.id} converted to sale`, 'success');
},

mapOrderProduct(items) {
    if (!items || items.length === 0) return 'other';
    
    // Map common order items to sales products
    const productMap = {
        'broilers': 'broilers-dressed',
        'chickens': 'broilers-dressed',
        'eggs': 'eggs',
        'milk': 'milk'
    };
    
    const firstItem = items[0];
    return productMap[firstItem.productId] || 'other';
},

calculateOrderQuantity(items) {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
},

calculateAveragePrice(orderData) {
    if (!orderData.items || orderData.items.length === 0) return 0;
    const totalQuantity = this.calculateOrderQuantity(orderData.items);
    return totalQuantity > 0 ? orderData.totalAmount / totalQuantity : 0;
},

// ==================== MISSING HELPER FUNCTIONS ====================

initializeDatePicker() {
    const dateInput = document.getElementById('sale-date');
    if (dateInput) {
        dateInput.value = this.getCurrentDate();
        
        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
    }
},

filterSales(period) {
    const salesTable = document.querySelector('.sales-section .data-table');
    if (!salesTable) return;
    
    const sales = this.getFilteredSales(period);
    const tbody = salesTable.querySelector('tbody');
    
    if (tbody) {
        tbody.innerHTML = sales.map(sale => `
            <tr>
                <td>${this.formatDate(sale.date)}</td>
                <td>
                    <div class="product-cell">
                        <span class="product-emoji">${this.getProductIcon(sale.product)}</span>
                        <span>${this.formatProductName(sale.product)}</span>
                    </div>
                </td>
                <td>${sale.customer || 'Walk-in'}</td>
                <td>${this.formatQuantity(sale)}</td>
                <td>${this.formatCurrency(sale.unitPrice)}/${sale.unit}</td>
                <td class="total-amount">${this.formatCurrency(sale.totalAmount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" data-action="edit-sale" data-sale-id="${sale.id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon" data-action="delete-sale" data-sale-id="${sale.id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
},

editSale(saleId) {
    const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
    if (sale) {
        this.showSaleModal(sale);
    } else {
        this.showNotification('Sale not found', 'error');
    }
},

showMeatSaleForm() {
    // Set product to first meat product and show modal
    this.showSaleModal();
    
    // Set to meat product and trigger change
    setTimeout(() => {
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.value = 'broilers-dressed';
            this.handleProductChange();
        }
    }, 100);
},

showProductionItems() {
    this.showProductionModal();
},

checkInventoryForSales(inventoryData) {
    // Check if we have enough inventory for sales
    console.log('📦 Checking inventory for sales:', inventoryData);
    
    // You could add low inventory warnings here
    const lowStockProducts = [];
    
    // Example: Check for low stock
    inventoryData.items?.forEach(item => {
        if (item.quantity < item.minimumStock) {
            lowStockProducts.push(item.name);
        }
    });
    
    if (lowStockProducts.length > 0) {
        console.warn('⚠️ Low stock items:', lowStockProducts);
    }
},

    renderSalesTable(period = 'today') {
        const sales = this.getFilteredSales(period);
        
        if (sales.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h4>No Sales Found</h4>
                    <p>Record your first sale to get started</p>
                </div>
            `;
        }
        
        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr>
                                <td>${this.formatDate(sale.date)}</td>
                                <td>
                                    <div class="product-cell">
                                        <span class="product-emoji">${this.getProductIcon(sale.product)}</span>
                                        <span>${this.formatProductName(sale.product)}</span>
                                    </div>
                                </td>
                                <td>${sale.customer || 'Walk-in'}</td>
                                <td>${this.formatQuantity(sale)}</td>
                                <td>${this.formatCurrency(sale.unitPrice)}/${sale.unit}</td>
                                <td class="total-amount">${this.formatCurrency(sale.totalAmount)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-icon" data-action="edit-sale" data-sale-id="${sale.id}" title="Edit">
                                            ✏️
                                        </button>
                                        <button class="btn-icon" data-action="delete-sale" data-sale-id="${sale.id}" title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderSaleModal() {
        return `
            <div class="modal" id="sale-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="sale-modal-title">Record New Sale</h3>
                        <button class="modal-close" data-action="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="sale-form">
                            <input type="hidden" id="sale-id">
                            <input type="hidden" id="production-source-id">
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sale-date">Sale Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="sale-customer">Customer</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name (optional)">
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sale-product">Product *</label>
                                    <select id="sale-product" class="form-input" required>
                                        <option value="">Select Product</option>
                                        ${this.renderProductOptions()}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-unit">Unit *</label>
                                    <select id="sale-unit" class="form-input" required>
                                        <option value="">Select Unit</option>
                                        ${this.renderUnitOptions()}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Meat Sale Section -->
                            <div id="meat-section" class="section" style="display: none;">
                                <div class="section-header">
                                    <span class="emoji">🍗</span> Meat Sale Details
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="meat-animal-count">Number of Animals *</label>
                                        <input type="number" id="meat-animal-count" class="form-input" min="1">
                                    </div>
                                    <div class="form-group">
                                        <label for="meat-weight">Total Weight *</label>
                                        <div class="input-with-unit">
                                            <input type="number" id="meat-weight" class="form-input" min="0.1" step="0.1">
                                            <select id="meat-weight-unit" class="form-unit">
                                                <option value="kg">kg</option>
                                                <option value="lbs">lbs</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="meat-price">Price per kg *</label>
                                    <input type="number" id="meat-price" class="form-input" min="0" step="0.01">
                                </div>
                            </div>
                            
                            <!-- Standard Sale Section -->
                            <div id="standard-section" class="section">
                                <div class="section-header">
                                    <span class="emoji">📦</span> Standard Sale Details
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="standard-quantity">Quantity *</label>
                                        <input type="number" id="standard-quantity" class="form-input" min="0.01" step="0.01">
                                    </div>
                                    <div class="form-group">
                                        <label for="standard-price">Unit Price *</label>
                                        <input type="number" id="standard-price" class="form-input" min="0" step="0.01">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sale-payment">Payment Method *</label>
                                    <select id="sale-payment" class="form-input" required>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="transfer">Transfer</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-status">Payment Status</label>
                                    <select id="sale-status" class="form-input">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="sale-notes">Notes</label>
                                <textarea id="sale-notes" class="form-input" rows="3" placeholder="Additional notes..."></textarea>
                            </div>
                            
                            <div class="total-section">
                                <div class="total-label">Sale Total:</div>
                                <div class="total-amount" id="sale-total">$0.00</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel-sale">Cancel</button>
                        <button class="btn btn-danger" id="btn-delete-sale" style="display: none;">Delete</button>
                        <button class="btn btn-primary" data-action="save-sale">Save Sale</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ==================== EVENT HANDLING ====================

    setupEventDelegation() {
        // Remove existing listeners first
        document.removeEventListener('click', this.handleClick);
        
        // Add new delegated listener
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
        
        // Form input listeners
        document.addEventListener('input', this.handleInput.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
    },

        handleClick(event) {
        const target = event.target;
        const action = target.dataset.action || target.closest('[data-action]')?.dataset.action;
        
        if (!action) return;
        
        event.preventDefault();
        
        switch (action) {
            // Main buttons
            case 'btn-new-sale':
                this.showSaleModal();
                break;
            case 'btn-from-production':
                this.showProductionModal();
                break;
            
            // Quick action cards
            case 'quick-sale':
                this.showQuickSaleForm();
                break;
            case 'meat-sale':
                this.showMeatSaleForm();
                break;
            case 'production-sale':
                this.showProductionItems();
                break;
            case 'generate-report':
                this.generateDailyReport();
                break;
            
            // Production items
            case 'sell-production-item':
            case 'sell-item':  // Handle both cases
                const itemId = target.dataset.itemId || target.closest('[data-item-id]')?.dataset.itemId;
                if (itemId) this.sellProductionItem(itemId);
                break;
            
            // Navigation
            case 'go-to-production':
                this.navigateToProduction();
                break;
            
            // Sales table actions
            case 'edit-sale':
                const saleId = target.dataset.saleId || target.closest('[data-sale-id]')?.dataset.saleId;
                this.editSale(saleId);
                break;
            case 'delete-sale':
                const deleteSaleId = target.dataset.saleId || target.closest('[data-sale-id]')?.dataset.saleId;
                this.deleteSale(deleteSaleId);
                break;
            
            // Sale modal actions
            case 'save-sale':
                this.saveSale();
                break;
            case 'cancel-sale':
                this.hideModal('sale-modal');
                break;
            
            // Modal actions
            case 'close-modal':
                this.hideModal(event.target.closest('.modal').id || 'sale-modal');
                break;
            case 'new-production-sale':
                this.showSaleModal();
                break;
            
            // Report actions
            case 'print-report':
                window.print();
                break;
            
            // Quick sale actions
            case 'cancel-quick-sale':
                this.hideModal('quick-sale-modal');
                break;
            
            // View all production
            case 'view-all-production':
                this.showProductionModal();
                break;
            
            // Add more cases as needed
            default:
                console.warn(`Unknown action: ${action}`);
                break;
        }
    },

    handleInput(event) {
        const target = event.target;
        
        if (target.id === 'standard-quantity' || target.id === 'standard-price' ||
            target.id === 'meat-animal-count' || target.id === 'meat-weight' || 
            target.id === 'meat-price') {
            this.calculateSaleTotal();
        }
    },

    handleChange(event) {
        const target = event.target;
        
        if (target.id === 'sale-product') {
            this.handleProductChange();
        } else if (target.id === 'filter-period') {
            this.filterSales(target.value);
        }
    },

    // ==================== SALE MANAGEMENT ====================

    showSaleModal(saleData = null) {
        const modal = document.getElementById('sale-modal');
        if (!modal) return;
        
        if (saleData) {
            this.currentSaleId = saleData.id;
            this.populateSaleForm(saleData);
            document.getElementById('sale-modal-title').textContent = 'Edit Sale';
            document.getElementById('btn-delete-sale').style.display = 'block';
        } else {
            this.currentSaleId = null;
            this.resetSaleForm();
            document.getElementById('sale-modal-title').textContent = 'Record New Sale';
            document.getElementById('btn-delete-sale').style.display = 'none';
        }
        
        modal.classList.add('active');
    },

    resetSaleForm() {
        const form = document.getElementById('sale-form');
        if (form) form.reset();
        
        const today = this.getCurrentDate();
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = today;
        
        this.calculateSaleTotal();
    },

    populateSaleForm(sale) {
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = sale.date;
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit;
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        if (this.isMeatProduct(sale.product)) {
            document.getElementById('meat-animal-count').value = sale.animalCount || '';
            document.getElementById('meat-weight').value = sale.weight || '';
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.unitPrice || '';
        } else {
            document.getElementById('standard-quantity').value = sale.quantity || '';
            document.getElementById('standard-price').value = sale.unitPrice || '';
        }
        
        this.handleProductChange();
        this.calculateSaleTotal();
    },

    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        const product = productSelect ? productSelect.value : '';
        const isMeat = this.isMeatProduct(product);
        
        const meatSection = document.getElementById('meat-section');
        const standardSection = document.getElementById('standard-section');
        
        if (meatSection) meatSection.style.display = isMeat ? 'block' : 'none';
        if (standardSection) standardSection.style.display = isMeat ? 'none' : 'block';
        
        // Set default price
        this.setDefaultPrice(product);
    },

    calculateSaleTotal() {
        let total = 0;
        const product = document.getElementById('sale-product')?.value;
        
        if (this.isMeatProduct(product)) {
            const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
            const price = parseFloat(document.getElementById('meat-price')?.value) || 0;
            total = weight * price;
        } else {
            const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
            const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
            total = quantity * price;
        }
        
        const totalElement = document.getElementById('sale-total');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    saveSale() {
        const saleData = this.collectSaleFormData();
        
        if (!this.validateSale(saleData)) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }
        
        if (this.currentSaleId) {
            // Update existing sale
            this.updateSale(this.currentSaleId, saleData);
        } else {
            // Add new sale
            this.addSale(saleData);
        }
        
        this.hideModal('sale-modal');
        this.render();
        this.saveData();
        
        this.showNotification('Sale saved successfully!', 'success');
    },

    collectSaleFormData() {
        const form = document.getElementById('sale-form');
        const formData = new FormData(form);
        
        const sale = {
            id: this.currentSaleId || 'SALE-' + Date.now(),
            date: formData.get('sale-date'),
            customer: formData.get('sale-customer'),
            product: formData.get('sale-product'),
            unit: formData.get('sale-unit'),
            paymentMethod: formData.get('sale-payment'),
            paymentStatus: formData.get('sale-status'),
            notes: formData.get('sale-notes'),
            createdAt: new Date().toISOString()
        };
        
        if (this.isMeatProduct(sale.product)) {
            sale.animalCount = parseInt(formData.get('meat-animal-count')) || 0;
            sale.weight = parseFloat(formData.get('meat-weight')) || 0;
            sale.weightUnit = formData.get('meat-weight-unit');
            sale.unitPrice = parseFloat(formData.get('meat-price')) || 0;
            sale.quantity = sale.animalCount;
            sale.totalAmount = sale.weight * sale.unitPrice;
        } else {
            sale.quantity = parseFloat(formData.get('standard-quantity')) || 0;
            sale.unitPrice = parseFloat(formData.get('standard-price')) || 0;
            sale.totalAmount = sale.quantity * sale.unitPrice;
        }
        
        return sale;
    },

    validateSale(sale) {
        if (!sale.date || !sale.product || !sale.unit || !sale.paymentMethod) {
            return false;
        }
        
        if (this.isMeatProduct(sale.product)) {
            if (!sale.animalCount || sale.animalCount <= 0) return false;
            if (!sale.weight || sale.weight <= 0) return false;
            if (!sale.unitPrice || sale.unitPrice <= 0) return false;
        } else {
            if (!sale.quantity || sale.quantity <= 0) return false;
            if (!sale.unitPrice || sale.unitPrice <= 0) return false;
        }
        
        return true;
    },

    addSale(sale) {
        window.FarmModules.appData.sales.push(sale);
        this.broadcastSaleRecorded(sale);
    },

    updateSale(saleId, updatedData) {
        const index = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
        if (index !== -1) {
            const oldSale = window.FarmModules.appData.sales[index];
            window.FarmModules.appData.sales[index] = { ...oldSale, ...updatedData };
            
            this.broadcast('sale-updated', {
                saleId: saleId,
                oldTotal: oldSale.totalAmount,
                newTotal: updatedData.totalAmount
            });
        }
    },

    deleteSale(saleId) {
        if (!confirm('Are you sure you want to delete this sale?')) return;
        
        const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
        if (sale) {
            window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
            
            this.broadcast('sale-deleted', {
                saleId: saleId,
                amount: sale.totalAmount
            });
            
            this.render();
            this.saveData();
            this.showNotification('Sale deleted successfully', 'success');
        }
    },
    
        // ==================== MISSING QUICK SALE FUNCTIONS ====================

    showQuickSaleForm() {
        const form = document.createElement('form');
        form.className = 'quick-sale-form';
        form.innerHTML = `
            <div class="form-header">
                <h4><span class="emoji">⚡</span> Quick Sale</h4>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Product</label>
                    <select class="form-input" id="quick-product">
                        <option value="broilers-dressed">🍗 Broilers</option>
                        <option value="eggs">🥚 Eggs</option>
                        <option value="milk">🥛 Milk</option>
                        <option value="tomatoes">🍅 Tomatoes</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="form-input" id="quick-quantity" value="1" min="1">
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="form-input" id="quick-price" step="0.01" min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Customer (optional)</label>
                <input type="text" class="form-input" id="quick-customer" placeholder="Customer name">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-action="cancel-quick-sale">Cancel</button>
                <button type="submit" class="btn btn-primary">Record Sale</button>
            </div>
        `;
        
        // Show as modal or inline
        this.showCustomModal(form.outerHTML, 'quick-sale-modal');
        
        // Set default price
        const productSelect = document.getElementById('quick-product');
        if (productSelect) {
            productSelect.addEventListener('change', (e) => {
                this.setQuickDefaultPrice(e.target.value);
            });
            this.setQuickDefaultPrice(productSelect.value);
        }
        
        // Handle form submission
        const modal = document.getElementById('quick-sale-modal');
        if (modal) {
            modal.querySelector('form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processQuickSale();
            });
        }
    },

    setQuickDefaultPrice(product) {
        const prices = {
            'broilers-dressed': 5.50,
            'eggs': 3.25,
            'milk': 2.50,
            'tomatoes': 1.75
        };
        
        const priceInput = document.getElementById('quick-price');
        if (priceInput && prices[product]) {
            priceInput.value = prices[product];
        }
    },

    processQuickSale() {
        const product = document.getElementById('quick-product')?.value;
        const quantity = parseFloat(document.getElementById('quick-quantity')?.value) || 0;
        const price = parseFloat(document.getElementById('quick-price')?.value) || 0;
        const customer = document.getElementById('quick-customer')?.value;
        
        if (!product || quantity <= 0 || price <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const sale = {
            id: 'QS-' + Date.now(),
            date: this.getCurrentDate(),
            product: product,
            quantity: quantity,
            unit: 'units',
            unitPrice: price,
            totalAmount: quantity * price,
            customer: customer || 'Walk-in',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            createdAt: new Date().toISOString()
        };
        
        this.addSale(sale);
        this.hideModal('quick-sale-modal');
        this.render();
        this.saveData();
        this.showNotification('Quick sale recorded!', 'success');
    },

    // ==================== PRODUCTION INTEGRATION ====================

    getAvailableProductionItems(productionData) {
        const soldItems = {};
        
        // Calculate sold quantities
        window.FarmModules.appData.sales.forEach(sale => {
            if (sale.productionSourceId) {
                if (!soldItems[sale.productionSourceId]) {
                    soldItems[sale.productionSourceId] = 0;
                }
                soldItems[sale.productionSourceId] += sale.quantity;
            }
        });
        
        // Filter available items
        return productionData.filter(item => {
            const sold = soldItems[item.id] || 0;
            return (item.quantity - sold) > 0;
        }).map(item => ({
            ...item,
            availableQuantity: item.quantity - (soldItems[item.id] || 0)
        }));
    },

        // ==================== MISSING RENDER FUNCTIONS ====================

    renderProductOptions() {
        const products = {
            'Livestock (Meat)': [
                { value: 'broilers-dressed', label: 'Broilers (Dressed)', emoji: '🍗' },
                { value: 'pork', label: 'Pork', emoji: '🐖' },
                { value: 'beef', label: 'Beef', emoji: '🐄' },
                { value: 'chicken-parts', label: 'Chicken Parts', emoji: '🍗' },
                { value: 'goat', label: 'Goat', emoji: '🐐' },
                { value: 'lamb', label: 'Lamb', emoji: '🐑' }
            ],
            'Poultry': [
                { value: 'broilers-live', label: 'Broilers (Live)', emoji: '🐔' },
                { value: 'layers', label: 'Layers', emoji: '🐓' },
                { value: 'chicks', label: 'Baby Chicks', emoji: '🐤' }
            ],
            'Eggs & Dairy': [
                { value: 'eggs', label: 'Eggs', emoji: '🥚' },
                { value: 'milk', label: 'Milk', emoji: '🥛' },
                { value: 'cheese', label: 'Cheese', emoji: '🧀' },
                { value: 'yogurt', label: 'Yogurt', emoji: '🥛' }
            ],
            'Produce': [
                { value: 'tomatoes', label: 'Tomatoes', emoji: '🍅' },
                { value: 'peppers', label: 'Peppers', emoji: '🌶️' },
                { value: 'cucumbers', label: 'Cucumbers', emoji: '🥒' },
                { value: 'lettuce', label: 'Lettuce', emoji: '🥬' }
            ]
        };
        
        let html = '';
        
        for (const [category, items] of Object.entries(products)) {
            html += `<optgroup label="${category}">`;
            items.forEach(item => {
                html += `<option value="${item.value}">${item.emoji} ${item.label}</option>`;
            });
            html += '</optgroup>';
        }
        
        html += `<optgroup label="Other">
                    <option value="honey">🍯 Honey</option>
                    <option value="bread">🍞 Bread</option>
                    <option value="other">📦 Other</option>
                </optgroup>`;
        
        return html;
    },

    renderUnitOptions() {
        const units = [
            { value: 'kg', label: 'Kilograms (kg)', category: 'weight' },
            { value: 'lbs', label: 'Pounds (lbs)', category: 'weight' },
            { value: 'birds', label: 'Birds', category: 'count' },
            { value: 'animals', label: 'Animals', category: 'count' },
            { value: 'dozen', label: 'Dozen', category: 'count' },
            { value: 'pieces', label: 'Pieces', category: 'count' },
            { value: 'liters', label: 'Liters', category: 'volume' },
            { value: 'cases', label: 'Cases', category: 'count' },
            { value: 'crates', label: 'Crates', category: 'count' }
        ];
        
        let html = '';
        
        const grouped = {};
        units.forEach(unit => {
            if (!grouped[unit.category]) grouped[unit.category] = [];
            grouped[unit.category].push(unit);
        });
        
        for (const [category, categoryUnits] of Object.entries(grouped)) {
            html += `<optgroup label="${category.charAt(0).toUpperCase() + category.slice(1)}">`;
            categoryUnits.forEach(unit => {
                html += `<option value="${unit.value}">${unit.label}</option>`;
            });
            html += '</optgroup>';
        }
        
        return html;
    },

    renderProductionModal() {
        return `
            <div class="modal" id="production-modal">
                <!-- Content will be dynamically generated -->
            </div>
        `;
    },

    renderReportModal() {
        return `
            <div class="modal" id="report-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><span class="emoji">📊</span> Sales Report</h3>
                        <button class="modal-close" data-action="close-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="report-content">
                        <!-- Report content will be inserted here -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="close-modal">Close</button>
                        <button class="btn btn-primary" data-action="print-report">🖨️ Print</button>
                    </div>
                </div>
            </div>
        `;
    },

    sellProductionItem(itemId) {
        const productionData = JSON.parse(localStorage.getItem('farm_production') || '[]');
        const item = productionData.find(p => p.id === itemId);
        
        if (!item) {
            this.showNotification('Production item not found', 'error');
            return;
        }
        
        this.pendingProductionSale = item;
        this.showSaleModal();
        
        // Pre-fill form
        document.getElementById('sale-product').value = item.product;
        document.getElementById('sale-unit').value = item.unit;
        document.getElementById('production-source-id').value = item.id;
        
        this.handleProductChange();
        
        // Set available quantity
        const availableItems = this.getAvailableProductionItems(productionData);
        const availableItem = availableItems.find(a => a.id === itemId);
        
        if (availableItem) {
            if (this.isMeatProduct(item.product)) {
                document.getElementById('meat-animal-count').value = availableItem.availableQuantity;
            } else {
                document.getElementById('standard-quantity').value = availableItem.availableQuantity;
            }
        }
        
        this.calculateSaleTotal();
    },

        // ==================== MISSING EVENT HANDLERS ====================

    handleProductionUpdate(data) {
        console.log('🔄 Handling production update:', data);
        
        // Re-render production section if visible
        const productionSection = document.querySelector('.production-section');
        if (productionSection) {
            const newContent = this.renderProductionItems();
            const itemsGrid = productionSection.querySelector('.production-items-grid');
            if (itemsGrid) {
                itemsGrid.innerHTML = newContent;
            }
        }
    },

    convertOrderToSale(orderData) {
        console.log('📦 Converting order to sale:', orderData);
        
        const sale = {
            id: 'ORDER-' + orderData.id,
            date: this.getCurrentDate(),
            product: this.mapOrderProduct(orderData.items),
            quantity: this.calculateOrderQuantity(orderData.items),
            unit: 'items',
            unitPrice: this.calculateAveragePrice(orderData),
            totalAmount: orderData.totalAmount,
            customer: orderData.customerName || 'Order Customer',
            paymentMethod: 'order',
            paymentStatus: 'paid',
            notes: `Converted from order #${orderData.id}`,
            orderSource: true,
            orderId: orderData.id,
            createdAt: new Date().toISOString()
        };
        
        this.addSale(sale);
        this.render();
        this.saveData();
        this.showNotification(`Order #${orderData.id} converted to sale`, 'success');
    },

    mapOrderProduct(items) {
        if (!items || items.length === 0) return 'other';
        
        // Map common order items to sales products
        const productMap = {
            'broilers': 'broilers-dressed',
            'chickens': 'broilers-dressed',
            'eggs': 'eggs',
            'milk': 'milk'
        };
        
        const firstItem = items[0];
        return productMap[firstItem.productId] || 'other';
    },

    calculateOrderQuantity(items) {
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    calculateAveragePrice(orderData) {
        if (!orderData.items || orderData.items.length === 0) return 0;
        const totalQuantity = this.calculateOrderQuantity(orderData.items);
        return totalQuantity > 0 ? orderData.totalAmount / totalQuantity : 0;
    },

    // ==================== MISSING HELPER FUNCTIONS ====================

    initializeDatePicker() {
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = this.getCurrentDate();
            
            // Set max date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.max = today;
        }
    },

    filterSales(period) {
        const salesTable = document.querySelector('.sales-section .data-table');
        if (!salesTable) return;
        
        const sales = this.getFilteredSales(period);
        const tbody = salesTable.querySelector('tbody');
        
        if (tbody) {
            tbody.innerHTML = sales.map(sale => `
                <tr>
                    <td>${this.formatDate(sale.date)}</td>
                    <td>
                        <div class="product-cell">
                            <span class="product-emoji">${this.getProductIcon(sale.product)}</span>
                            <span>${this.formatProductName(sale.product)}</span>
                        </div>
                    </td>
                    <td>${sale.customer || 'Walk-in'}</td>
                    <td>${this.formatQuantity(sale)}</td>
                    <td>${this.formatCurrency(sale.unitPrice)}/${sale.unit}</td>
                    <td class="total-amount">${this.formatCurrency(sale.totalAmount)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" data-action="edit-sale" data-sale-id="${sale.id}" title="Edit">
                                ✏️
                            </button>
                            <button class="btn-icon" data-action="delete-sale" data-sale-id="${sale.id}" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    editSale(saleId) {
        const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
        if (sale) {
            this.showSaleModal(sale);
        } else {
            this.showNotification('Sale not found', 'error');
        }
    },

    showMeatSaleForm() {
        // Set product to first meat product and show modal
        this.showSaleModal();
        
        // Set to meat product and trigger change
        setTimeout(() => {
            const productSelect = document.getElementById('sale-product');
            if (productSelect) {
                productSelect.value = 'broilers-dressed';
                this.handleProductChange();
            }
        }, 100);
    },

    showProductionItems() {
        this.showProductionModal();
    },

    checkInventoryForSales(inventoryData) {
        // Check if we have enough inventory for sales
        console.log('📦 Checking inventory for sales:', inventoryData);
        
        // You could add low inventory warnings here
        const lowStockProducts = [];
        
        // Example: Check for low stock
        inventoryData.items?.forEach(item => {
            if (item.quantity < item.minimumStock) {
                lowStockProducts.push(item.name);
            }
        });
        
        if (lowStockProducts.length > 0) {
            console.warn('⚠️ Low stock items:', lowStockProducts);
        }
    },

    // ==================== UTILITY METHODS ====================

    getCurrentDate() {
        return window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
    },

    formatDate(dateString) {
        if (window.DateUtils && window.DateUtils.formatDate) {
            return window.DateUtils.formatDate(dateString);
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatProductName(product) {
        const names = {
            'broilers-dressed': 'Broilers (Dressed)',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'goat': 'Goat',
            'lamb': 'Lamb',
            'broilers-live': 'Broilers (Live)',
            'layers': 'Layers',
            'eggs': 'Eggs',
            'milk': 'Milk'
        };
        
        return names[product] || product.charAt(0).toUpperCase() + product.slice(1).replace('-', ' ');
    },

    getProductIcon(product) {
        const icons = {
            'broilers-dressed': '🍗',
            'pork': '🐖',
            'beef': '🐄',
            'chicken-parts': '🍗',
            'goat': '🐐',
            'lamb': '🐑',
            'broilers-live': '🐔',
            'layers': '🐓',
            'eggs': '🥚',
            'milk': '🥛'
        };
        
        return icons[product] || '📦';
    },

    isMeatProduct(product) {
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        return meatProducts.includes(product);
    },

    formatQuantity(sale) {
        if (this.isMeatProduct(sale.product)) {
            return `${sale.animalCount} animals (${sale.weight} ${sale.weightUnit})`;
        }
        return `${sale.quantity} ${sale.unit}`;
    },

    getSales() {
        return window.FarmModules.appData.sales || [];
    },

    getFilteredSales(period) {
        const sales = this.getSales();
        
        if (period === 'all') return sales;
        
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (period) {
            case 'today':
                cutoffDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            default:
                return sales;
        }
        
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= cutoffDate;
        });
    },

        // ==================== MISSING REPORT FUNCTIONS ====================

    generateDailyReport() {
        const today = this.getCurrentDate();
        const sales = this.getFilteredSales('today');
        
        if (sales.length === 0) {
            this.showNotification('No sales recorded today', 'info');
            return;
        }
        
        const report = this.generateReportHTML('Today\'s Sales Report', today, sales);
        this.showReport(report);
    },

    generateReportHTML(title, date, sales) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const avgSale = sales.length > 0 ? totalRevenue / sales.length : 0;
        
        // Group by product
        const productSummary = {};
        sales.forEach(sale => {
            const product = this.formatProductName(sale.product);
            if (!productSummary[product]) {
                productSummary[product] = {
                    quantity: 0,
                    revenue: 0,
                    count: 0
                };
            }
            productSummary[product].quantity += sale.quantity;
            productSummary[product].revenue += sale.totalAmount;
            productSummary[product].count++;
        });
        
        // Group by payment method
        const paymentSummary = {};
        sales.forEach(sale => {
            const method = sale.paymentMethod || 'cash';
            if (!paymentSummary[method]) {
                paymentSummary[method] = {
                    count: 0,
                    revenue: 0
                };
            }
            paymentSummary[method].count++;
            paymentSummary[method].revenue += sale.totalAmount;
        });
        
        return `
            <div class="report">
                <div class="report-header">
                    <h2>${title}</h2>
                    <div class="report-date">${this.formatDate(date)}</div>
                </div>
                
                <div class="report-summary">
                    <div class="summary-card">
                        <div class="summary-value">${sales.length}</div>
                        <div class="summary-label">Total Sales</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${this.formatCurrency(totalRevenue)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${this.formatCurrency(avgSale)}</div>
                        <div class="summary-label">Average Sale</div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>📦 Products Sold</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Revenue</th>
                                <th>Avg Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(productSummary).map(([product, data]) => `
                                <tr>
                                    <td>${product}</td>
                                    <td>${data.quantity}</td>
                                    <td>${this.formatCurrency(data.revenue)}</td>
                                    <td>${this.formatCurrency(data.revenue / data.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h3>💳 Payment Methods</h3>
                    <div class="payment-grid">
                        ${Object.entries(paymentSummary).map(([method, data]) => `
                            <div class="payment-card">
                                <div class="payment-method">${method.toUpperCase()}</div>
                                <div class="payment-count">${data.count} sales</div>
                                <div class="payment-revenue">${this.formatCurrency(data.revenue)}</div>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
    },

    showReport(content) {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            reportContent.innerHTML = content;
        }
        
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    calculateStats() {
        const sales = this.getSales();
        const today = this.getCurrentDate();
        
        const todaySales = sales.filter(s => s.date === today);
        const meatSales = sales.filter(s => this.isMeatProduct(s.product));
        
        return {
            todayRevenue: todaySales.reduce((sum, s) => sum + s.totalAmount, 0),
            totalSales: sales.length,
            meatWeight: meatSales.reduce((sum, s) => sum + (s.weight || 0), 0),
            animalsSold: meatSales.reduce((sum, s) => sum + (s.animalCount || 0), 0)
        };
    },

    setDefaultPrice(product) {
        const prices = {
            'broilers-dressed': 5.50,
            'pork': 4.25,
            'beef': 6.75,
            'chicken-parts': 3.95,
            'goat': 5.25,
            'lamb': 6.50,
            'broilers-live': 4.00,
            'layers': 12.00,
            'eggs': 3.25,
            'milk': 2.50
        };
        
        const price = prices[product];
        if (price) {
            if (this.isMeatProduct(product)) {
                document.getElementById('meat-price').value = price;
            } else {
                document.getElementById('standard-price').value = price;
            }
            this.calculateSaleTotal();
        }
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    navigateToProduction() {
        if (window.FarmModules && window.FarmModules.Production) {
            window.FarmModules.Production.initialize();
        } else {
            this.showNotification('Production module not available', 'error');
        }
    },

    // ==================== MODULE LIFECYCLE ====================

    unload() {
        console.log('📦 Unloading Sales Record Module...');
        
        // Remove event listeners
        document.removeEventListener('click', this.handleClick);
        
        // Clear references
        this.element = null;
        this.broadcaster = null;
        this.initialized = false;
        
        console.log('✅ Sales Record Module unloaded');
    }
};

// ==================== MODULE REGISTRATION ====================

(function registerModule() {
    console.log('📝 Registering Sales Record Module...');
    
    if (!window.FarmModules) {
        console.error('❌ FarmModules framework not found');
        return;
    }
    
    // Register with FarmModules
    window.FarmModules.SalesRecord = SalesRecordModule;
    window.FarmModules.Sales = SalesRecordModule;
    
    // Add to modules map
    if (!window.FarmModules.modules) {
        window.FarmModules.modules = new Map();
    }
    
    window.FarmModules.modules.set('sales-record', SalesRecordModule);
    window.FarmModules.modules.set('sales', SalesRecordModule);
    
    console.log('✅ Sales Record Module registered successfully');
})();

// Export for module loading
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesRecordModule;
}
