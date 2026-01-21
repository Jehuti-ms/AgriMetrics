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
