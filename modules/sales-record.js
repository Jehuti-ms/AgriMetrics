// modules/sales-record.js
class SalesModule {
    constructor() {
        this.salesRecords = new Map();
        this.customers = new Map();
        this.products = new Map();
        this.init();
    }

    init() {
        console.log('💰 Sales module initialized');
        this.loadInitialData();
        this.setupDefaultProducts();
    }

    // ==================== SALES RECORDS MANAGEMENT ====================

    async addSale(saleData) {
        if (!this.validateSaleData(saleData)) {
            throw new Error('Invalid sale data');
        }

        const saleRecord = {
            id: this.generateId('sale'),
            timestamp: new Date().toISOString(),
            customerId: saleData.customerId,
            customerName: saleData.customerName,
            items: saleData.items || [],
            totalAmount: this.calculateTotal(saleData.items),
            paymentStatus: saleData.paymentStatus || 'pending',
            paymentMethod: saleData.paymentMethod || 'cash',
            notes: saleData.notes || '',
            status: 'completed'
        };

        // Update inventory if items are being sold
        await this.updateInventoryOnSale(saleRecord.items);

        this.salesRecords.set(saleRecord.id, saleRecord);
        await this.saveToStorage('sales', saleRecord);
        
        console.log(`✅ Sale recorded: ${saleRecord.id}`);
        return saleRecord.id;
    }

    async updateSale(saleId, updateData) {
        const existingSale = this.salesRecords.get(saleId);
        if (!existingSale) {
            throw new Error('Sale record not found');
        }

        const updatedSale = {
            ...existingSale,
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        // Recalculate total if items changed
        if (updateData.items) {
            updatedSale.totalAmount = this.calculateTotal(updateData.items);
        }

        this.salesRecords.set(saleId, updatedSale);
        await this.saveToStorage('sales', updatedSale);
        
        return saleId;
    }

    async deleteSale(saleId) {
        const sale = this.salesRecords.get(saleId);
        if (!sale) {
            throw new Error('Sale record not found');
        }

        // Restore inventory if needed
        await this.restoreInventoryOnDelete(sale.items);

        this.salesRecords.delete(saleId);
        await this.deleteFromStorage('sales', saleId);
        
        return true;
    }

    getSale(saleId) {
        return this.salesRecords.get(saleId);
    }

    getSales(filters = {}) {
        let records = Array.from(this.salesRecords.values());
        
        // Date filter
        if (filters.startDate && filters.endDate) {
            records = records.filter(record => {
                const recordDate = new Date(record.timestamp);
                return recordDate >= new Date(filters.startDate) && 
                       recordDate <= new Date(filters.endDate);
            });
        }
        
        // Customer filter
        if (filters.customerId) {
            records = records.filter(record => record.customerId === filters.customerId);
        }
        
        // Payment status filter
        if (filters.paymentStatus) {
            records = records.filter(record => record.paymentStatus === filters.paymentStatus);
        }
        
        // Product type filter
        if (filters.productType) {
            records = records.filter(record => 
                record.items.some(item => item.productType === filters.productType)
            );
        }

        return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // ==================== CUSTOMER MANAGEMENT ====================

    async addCustomer(customerData) {
        const customer = {
            id: this.generateId('cust'),
            ...customerData,
            createdAt: new Date().toISOString(),
            totalPurchases: 0,
            lastPurchase: null
        };

        this.customers.set(customer.id, customer);
        await this.saveToStorage('customers', customer);
        
        return customer.id;
    }

    getCustomer(customerId) {
        return this.customers.get(customerId);
    }

    getCustomers() {
        return Array.from(this.customers.values()).sort((a, b) => 
            a.name.localeCompare(b.name)
        );
    }

    async updateCustomer(customerId, updateData) {
        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const updatedCustomer = { ...customer, ...updateData };
        this.customers.set(customerId, updatedCustomer);
        await this.saveToStorage('customers', updatedCustomer);
        
        return customerId;
    }

    // ==================== PRODUCT MANAGEMENT ====================

    async addProduct(productData) {
        const product = {
            id: this.generateId('prod'),
            ...productData,
            createdAt: new Date().toISOString(),
            totalSold: 0,
            inStock: productData.initialStock || 0
        };

        this.products.set(product.id, product);
        await this.saveToStorage('products', product);
        
        return product.id;
    }

    getProducts() {
        return Array.from(this.products.values());
    }

    getProduct(productId) {
        return this.products.get(productId);
    }

    async updateProductStock(productId, quantityChange) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        product.inStock += quantityChange;
        if (product.inStock < 0) product.inStock = 0;

        this.products.set(productId, product);
        await this.saveToStorage('products', product);
        
        return product.inStock;
    }

    // ==================== ANALYTICS & REPORTING ====================

    getSalesAnalytics(period = 'month') {
        const records = this.getSales();
        const analytics = {
            totalRevenue: 0,
            totalUnits: 0,
            totalTransactions: records.length,
            salesByProduct: {},
            salesByCustomer: {},
            salesByPaymentMethod: {},
            dailySales: {},
            averageSale: 0,
            inventoryValue: 0
        };

        records.forEach(record => {
            analytics.totalRevenue += record.totalAmount;
            
            // Sales by product
            record.items.forEach(item => {
                analytics.totalUnits += item.quantity;
                
                const productType = item.productType;
                if (!analytics.salesByProduct[productType]) {
                    analytics.salesByProduct[productType] = { revenue: 0, units: 0 };
                }
                analytics.salesByProduct[productType].revenue += item.totalPrice;
                analytics.salesByProduct[productType].units += item.quantity;
            });

            // Sales by customer
            if (!analytics.salesByCustomer[record.customerId]) {
                analytics.salesByCustomer[record.customerId] = {
                    name: record.customerName,
                    revenue: 0,
                    transactions: 0
                };
            }
            analytics.salesByCustomer[record.customerId].revenue += record.totalAmount;
            analytics.salesByCustomer[record.customerId].transactions += 1;

            // Sales by payment method
            if (!analytics.salesByPaymentMethod[record.paymentMethod]) {
                analytics.salesByPaymentMethod[record.paymentMethod] = 0;
            }
            analytics.salesByPaymentMethod[record.paymentMethod] += record.totalAmount;

            // Daily sales
            const date = record.timestamp.split('T')[0];
            if (!analytics.dailySales[date]) {
                analytics.dailySales[date] = 0;
            }
            analytics.dailySales[date] += record.totalAmount;
        });

        // Calculate inventory value
        this.products.forEach(product => {
            analytics.inventoryValue += product.inStock * (product.price || 0);
        });

        analytics.averageSale = records.length > 0 ? analytics.totalRevenue / records.length : 0;
        
        return analytics;
    }

    getSalesReport(startDate, endDate, reportType = 'summary') {
        const sales = this.getSales({ startDate, endDate });
        const analytics = this.getSalesAnalytics();

        const report = {
            period: { startDate, endDate },
            summary: {
                totalRevenue: analytics.totalRevenue,
                totalTransactions: analytics.totalTransactions,
                averageSale: analytics.averageSale,
                topProducts: Object.entries(analytics.salesByProduct)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .slice(0, 5),
                topCustomers: Object.entries(analytics.salesByCustomer)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .slice(0, 5)
            },
            detailedSales: reportType === 'detailed' ? sales : undefined
        };

        return report;
    }

    // ==================== PAYMENT MANAGEMENT ====================

    async updatePaymentStatus(saleId, paymentStatus, paymentMethod = null) {
        const updateData = { paymentStatus };
        if (paymentMethod) {
            updateData.paymentMethod = paymentMethod;
        }

        return await this.updateSale(saleId, updateData);
    }

    getPendingPayments() {
        return this.getSales({ paymentStatus: 'pending' });
    }

    // ==================== INVENTORY INTEGRATION ====================

    async updateInventoryOnSale(items) {
        for (const item of items) {
            if (item.productId) {
                await this.updateProductStock(item.productId, -item.quantity);
                
                // Update product sales stats
                const product = this.products.get(item.productId);
                if (product) {
                    product.totalSold += item.quantity;
                    this.products.set(item.productId, product);
                    await this.saveToStorage('products', product);
                }
            }
        }
    }

    async restoreInventoryOnDelete(items) {
        for (const item of items) {
            if (item.productId) {
                await this.updateProductStock(item.productId, item.quantity);
            }
        }
    }

    // ==================== VALIDATION & UTILITIES ====================

    validateSaleData(saleData) {
        return saleData.customerId &&
               saleData.items && 
               saleData.items.length > 0 &&
               saleData.items.every(item => 
                   item.productType && 
                   item.quantity > 0 && 
                   item.unitPrice > 0
               );
    }

    calculateTotal(items) {
        return items.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    }

    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ==================== STORAGE MANAGEMENT ====================

    async saveToStorage(collection, record) {
        if (window.farmModules?.firebase) {
            try {
                await window.farmModules.firebase.saveRecord(collection, record);
            } catch (error) {
                console.warn(`Failed to save ${collection} to Firebase:`, error);
                this.saveToLocalStorage(collection, record);
            }
        } else {
            this.saveToLocalStorage(collection, record);
        }
    }

    async deleteFromStorage(collection, recordId) {
        if (window.farmModules?.firebase) {
            try {
                await window.farmModules.firebase.deleteRecord(collection, recordId);
            } catch (error) {
                console.warn(`Failed to delete ${collection} from Firebase:`, error);
                this.deleteFromLocalStorage(collection, recordId);
            }
        } else {
            this.deleteFromLocalStorage(collection, recordId);
        }
    }

    saveToLocalStorage(collection, record) {
        const key = `${collection}_${record.id}`;
        localStorage.setItem(key, JSON.stringify(record));
        
        // Update collection index
        const indexKey = `${collection}_index`;
        let index = JSON.parse(localStorage.getItem(indexKey) || '[]');
        if (!index.includes(record.id)) {
            index.push(record.id);
            localStorage.setItem(indexKey, JSON.stringify(index));
        }
    }

    deleteFromLocalStorage(collection, recordId) {
        const key = `${collection}_${recordId}`;
        localStorage.removeItem(key);
        
        // Update collection index
        const indexKey = `${collection}_index`;
        let index = JSON.parse(localStorage.getItem(indexKey) || '[]');
        index = index.filter(id => id !== recordId);
        localStorage.setItem(indexKey, JSON.stringify(index));
    }

    async loadInitialData() {
        // Load data from storage on initialization
        // This would typically load from Firebase or local storage
        console.log('📦 Loading sales data...');
    }

    setupDefaultProducts() {
        // Add default agricultural products if none exist
        if (this.products.size === 0) {
            const defaultProducts = [
                {
                    name: 'Maize',
                    productType: 'crop',
                    category: 'grains',
                    unit: 'kg',
                    price: 0.30,
                    initialStock: 1000
                },
                {
                    name: 'Tomatoes',
                    productType: 'crop', 
                    category: 'vegetables',
                    unit: 'kg',
                    price: 1.20,
                    initialStock: 500
                },
                {
                    name: 'Chicken',
                    productType: 'livestock',
                    category: 'poultry', 
                    unit: 'each',
                    price: 8.50,
                    initialStock: 100
                },
                {
                    name: 'Fish',
                    productType: 'aquaculture',
                    category: 'seafood',
                    unit: 'kg',
                    price: 6.00,
                    initialStock: 200
                }
            ];

            defaultProducts.forEach(product => {
                this.addProduct(product);
            });
        }
    }

    // ==================== MODULE REGISTRATION ====================

    static getModuleInfo() {
        return {
            id: 'sales-record',
            name: 'Sales Records',
            routes: ['sales-record'],
            menuItems: [
                { id: 'sales-record', label: 'Sales Records', icon: '💰' }
            ]
        };
    }
}

// PROPER REGISTRATION FIX
try {
    if (typeof FarmModules !== 'undefined') {
        // Register with FarmModules framework
        FarmModules.registerModule('sales-record', SalesModule);
        console.log('✅ Sales module registered with FarmModules');
    } else if (window.farmModules) {
        // Register with farmModules framework
        window.farmModules.registerModule('sales-record', SalesModule);
        console.log('✅ Sales module registered with farmModules');
    } else {
        // Fallback registration
        console.warn('⚠️ Framework not found, using fallback registration');
        if (!window.salesModule) {
            window.salesModule = new SalesModule();
        }
    }
} catch (error) {
    console.error('❌ Sales module registration failed:', error);
}

console.log('💰 Sales Records module loaded successfully');
