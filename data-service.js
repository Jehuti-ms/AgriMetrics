// data-service.js - Central Data Management for Farm App
console.log('📦 Loading Data Service...');

const DataService = {
    // Central data store
    data: {
        transactions: [],
        sales: [],
        inventory: [],
        production: [],
        feed: [],
        mortality: [],
        orders: [],
        customers: []
    },
    
    // Loading state
    isLoading: false,
    lastLoadTime: null,
    listeners: [],
    
    // Initialize - call after login
   async initialize() {
    console.log('🚀 Initializing Data Service...');
    this.isLoading = true;
    
    this._dispatchEvent('data-loading-started');
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('⚠️ No user logged in');
            this.isLoading = false;
            return false;
        }
        
        console.log(`👤 Loading data for user: ${user.uid}`);
        
        // ===== LOAD FROM LOCALSTORAGE FIRST =====
        console.log('💾 Loading from localStorage for immediate data...');
        this.loadFromLocalStorage();
        
        // Make data available immediately
        window.FarmData = this.data;
        
        // Dispatch event that we have localStorage data
        this._dispatchEvent('data-loaded', this.data);
        
        // ===== CHECK MODULES FOR DATA =====
        // Give modules time to load
        setTimeout(() => {
            // Check if modules have data we don't have
            if (window.IncomeExpensesModule && window.IncomeExpensesModule.transactions) {
                if (window.IncomeExpensesModule.transactions.length > this.data.transactions.length) {
                    console.log('📦 IncomeExpensesModule has more transactions, updating...');
                    this.data.transactions = window.IncomeExpensesModule.transactions;
                    window.FarmData = this.data;
                    this._dispatchEvent('data-updated', this.data);
                }
            }
        }, 2000);
        
        // ===== SYNC LOCAL DATA TO FIREBASE =====
        if (this.data.transactions.length > 0 || this.data.sales.length > 0) {
            console.log('📤 Found localStorage data, syncing to Firebase...');
            await this.syncLocalToFirebase();
        }
        
        // ===== THEN LOAD FROM FIREBASE =====
        console.log('☁️ Loading from Firebase in background...');
        
        Promise.allSettled([
            this.loadTransactions(user.uid),
            this.loadSales(user.uid),
            this.loadInventory(user.uid),
            this.loadProduction(user.uid),
            this.loadFeed(user.uid),
            this.loadMortality(user.uid),
            this.loadOrders(user.uid),
            this.loadCustomers(user.uid)
        ]).then(() => {
            this.lastLoadTime = new Date().toISOString();
            this.isLoading = false;
            
            window.FarmData = this.data;
            this.saveToLocalStorage();
            
            console.log('✅ Data Service initialized with:', this.getStats());
            this._dispatchEvent('data-loaded', this.data);
            this.setupRealtimeListeners(user.uid);
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Data Service initialization error:', error);
        this.isLoading = false;
        this._dispatchEvent('data-error', error);
        return false;
    }
},

// Add this method to sync localStorage to Firebase
async syncLocalToFirebase() {
    console.log('🔄 Syncing localStorage data to Firebase...');
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const period = `${month}-${year}`;
    
    // Sync transactions to income collection
    if (this.data.transactions.length > 0) {
        console.log(`📤 Uploading ${this.data.transactions.length} transactions to Firebase...`);
        
        try {
            await db.collection('income').doc(user.uid).collection('transactions').doc(period).set({
                entries: this.data.transactions,
                totalAmount: this.data.transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + (t.amount || 0), 0),
                lastUpdated: new Date().toISOString(),
                userId: user.uid,
                syncedFrom: 'localStorage'
            }, { merge: true });
            
            console.log('✅ Transactions synced to Firebase');
        } catch (e) {
            console.error('❌ Error syncing transactions:', e);
        }
    }
    
    // Sync sales to sales collection
    if (this.data.sales.length > 0) {
        console.log(`📤 Uploading ${this.data.sales.length} sales to Firebase...`);
        
        try {
            await db.collection('sales').doc(user.uid).collection('records').doc(period).set({
                entries: this.data.sales,
                totalAmount: this.data.sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
                lastUpdated: new Date().toISOString(),
                userId: user.uid,
                syncedFrom: 'localStorage'
            }, { merge: true });
            
            console.log('✅ Sales synced to Firebase');
        } catch (e) {
            console.error('❌ Error syncing sales:', e);
        }
    }
    
    // Sync inventory if needed
    if (this.data.inventory.length > 0) {
        try {
            await db.collection('inventory').doc(user.uid).set({
                items: this.data.inventory,
                lastUpdated: new Date().toISOString(),
                userId: user.uid,
                syncedFrom: 'localStorage'
            }, { merge: true });
            
            console.log('✅ Inventory synced to Firebase');
        } catch (e) {
            console.error('❌ Error syncing inventory:', e);
        }
    }
},

// Also make sure saveToLocalStorage exists
saveToLocalStorage() {
    try {
        localStorage.setItem('farm-transactions', JSON.stringify(this.data.transactions));
        localStorage.setItem('farm-sales', JSON.stringify(this.data.sales));
        localStorage.setItem('farm-inventory', JSON.stringify(this.data.inventory));
        localStorage.setItem('farm-production', JSON.stringify(this.data.production));
        localStorage.setItem('farm-feed-records', JSON.stringify(this.data.feed));
        localStorage.setItem('farm-mortality-records', JSON.stringify(this.data.mortality));
        localStorage.setItem('farm-orders', JSON.stringify(this.data.orders));
        localStorage.setItem('farm-customers', JSON.stringify(this.data.customers));
        console.log('💾 Saved all data to localStorage');
    } catch (e) {
        console.warn('⚠️ Error saving to localStorage:', e);
    }
},
    
// Add this method to save data to localStorage
saveToLocalStorage() {
    try {
        localStorage.setItem('farm-transactions', JSON.stringify(this.data.transactions));
        localStorage.setItem('farm-sales', JSON.stringify(this.data.sales));
        localStorage.setItem('farm-inventory', JSON.stringify(this.data.inventory));
        localStorage.setItem('farm-production', JSON.stringify(this.data.production));
        localStorage.setItem('farm-feed-records', JSON.stringify(this.data.feed));
        localStorage.setItem('farm-mortality-records', JSON.stringify(this.data.mortality));
        localStorage.setItem('farm-orders', JSON.stringify(this.data.orders));
        localStorage.setItem('farm-customers', JSON.stringify(this.data.customers));
        console.log('💾 Saved all data to localStorage');
    } catch (e) {
        console.warn('⚠️ Error saving to localStorage:', e);
    }
},
   
    // ===== FIREBASE LOADERS =====
    
    async loadTransactions(userId) {
        try {
            console.log('📥 Loading transactions from Firebase...');
            const transactions = [];
            
            // Try multiple paths
            const paths = [
                { coll: 'income', sub: 'transactions' },
                { coll: 'income-expenses', sub: 'transactions' },
                { coll: 'transactions', sub: null }
            ];
            
            for (const path of paths) {
                try {
                    let snapshot;
                    if (path.sub) {
                        snapshot = await db.collection(path.coll)
                            .doc(userId).collection(path.sub).get();
                    } else {
                        snapshot = await db.collection(path.coll)
                            .where('userId', '==', userId).get();
                    }
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            if (data.entries) transactions.push(...data.entries);
                            else if (data.transactions) transactions.push(...data.transactions);
                            else if (Array.isArray(data)) transactions.push(...data);
                            else transactions.push(data);
                        });
                        break; // Found data, stop trying other paths
                    }
                } catch (e) {
                    // Try next path
                }
            }
            
            this.data.transactions = transactions;
            console.log(`✅ Loaded ${transactions.length} transactions`);
            
        } catch (error) {
            console.error('❌ Error loading transactions:', error);
        }
    },
    
    async loadSales(userId) {
        try {
            console.log('📥 Loading sales from Firebase...');
            const sales = [];
            
            const snapshot = await db.collection('sales')
                .doc(userId).collection('records').get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) sales.push(...data.entries);
                else if (Array.isArray(data)) sales.push(...data);
                else sales.push(data);
            });
            
            this.data.sales = sales;
            console.log(`✅ Loaded ${sales.length} sales`);
            
        } catch (error) {
            console.error('❌ Error loading sales:', error);
        }
    },
    
    async loadInventory(userId) {
        try {
            console.log('📥 Loading inventory from Firebase...');
            const doc = await db.collection('inventory').doc(userId).get();
            
            if (doc.exists) {
                const data = doc.data();
                this.data.inventory = data.items || data.inventory || [];
            } else {
                this.data.inventory = [];
            }
            
            console.log(`✅ Loaded ${this.data.inventory.length} inventory items`);
            
        } catch (error) {
            console.error('❌ Error loading inventory:', error);
        }
    },
    
    async loadProduction(userId) {
        try {
            console.log('📥 Loading production from Firebase...');
            const production = [];
            
            const snapshot = await db.collection('production')
                .doc(userId).collection('records').get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) production.push(...data.entries);
                else if (Array.isArray(data)) production.push(...data);
                else production.push(data);
            });
            
            this.data.production = production;
            console.log(`✅ Loaded ${production.length} production records`);
            
        } catch (error) {
            console.error('❌ Error loading production:', error);
        }
    },
    
    async loadFeed(userId) {
        try {
            console.log('📥 Loading feed records from Firebase...');
            const feed = [];
            
            const snapshot = await db.collection('feed')
                .doc(userId).collection('records').get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) feed.push(...data.entries);
                else if (Array.isArray(data)) feed.push(...data);
                else feed.push(data);
            });
            
            this.data.feed = feed;
            console.log(`✅ Loaded ${feed.length} feed records`);
            
        } catch (error) {
            console.error('❌ Error loading feed:', error);
        }
    },
    
    async loadMortality(userId) {
        try {
            console.log('📥 Loading mortality records from Firebase...');
            const mortality = [];
            
            const snapshot = await db.collection('mortality')
                .doc(userId).collection('records').get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) mortality.push(...data.entries);
                else if (Array.isArray(data)) mortality.push(...data);
                else mortality.push(data);
            });
            
            this.data.mortality = mortality;
            console.log(`✅ Loaded ${mortality.length} mortality records`);
            
        } catch (error) {
            console.error('❌ Error loading mortality:', error);
        }
    },
    
    async loadOrders(userId) {
        try {
            console.log('📥 Loading orders from Firebase...');
            const orders = [];
            
            const snapshot = await db.collection('orders')
                .doc(userId).collection('records').get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) orders.push(...data.entries);
                else if (Array.isArray(data)) orders.push(...data);
                else orders.push(data);
            });
            
            this.data.orders = orders;
            console.log(`✅ Loaded ${orders.length} orders`);
            
        } catch (error) {
            console.error('❌ Error loading orders:', error);
        }
    },
    
    async loadCustomers(userId) {
        try {
            console.log('📥 Loading customers from Firebase...');
            const customers = [];
            
            const snapshot = await db.collection('customers')
                .doc(userId).collection('records').get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) customers.push(...data.entries);
                else if (Array.isArray(data)) customers.push(...data);
                else customers.push(data);
            });
            
            this.data.customers = customers;
            console.log(`✅ Loaded ${customers.length} customers`);
            
        } catch (error) {
            console.error('❌ Error loading customers:', error);
        }
    },
    
    // ===== LOCAL STORAGE FALLBACK =====
   loadFromLocalStorage() {
    console.log('💾 Loading data from all sources...');
    
    // ===== FIRST: Try to get from modules (they have the freshest data) =====
    if (window.IncomeExpensesModule && window.IncomeExpensesModule.transactions) {
        this.data.transactions = window.IncomeExpensesModule.transactions;
        console.log(`  ✅ Got ${this.data.transactions.length} transactions from IncomeExpensesModule`);
    }
    
    if (window.SalesRecordModule && window.SalesRecordModule.sales) {
        this.data.sales = window.SalesRecordModule.sales;
        console.log(`  ✅ Got ${this.data.sales.length} sales from SalesRecordModule`);
    }
    
    if (window.InventoryModule && window.InventoryModule.inventory) {
        this.data.inventory = window.InventoryModule.inventory;
        console.log(`  ✅ Got ${this.data.inventory.length} inventory items from InventoryModule`);
    }
    
    if (window.ProductionModule && window.ProductionModule.productionRecords) {
        this.data.production = window.ProductionModule.productionRecords;
        console.log(`  ✅ Got ${this.data.production.length} production records from ProductionModule`);
    }
    
    if (window.FeedModule && window.FeedModule.feedRecords) {
        this.data.feed = window.FeedModule.feedRecords;
        console.log(`  ✅ Got ${this.data.feed.length} feed records from FeedModule`);
    }
    
    if (window.BroilerMortalityModule && window.BroilerMortalityModule.records) {
        this.data.mortality = window.BroilerMortalityModule.records;
        console.log(`  ✅ Got ${this.data.mortality.length} mortality records from BroilerMortalityModule`);
    }
    
    if (window.OrdersModule && window.OrdersModule.orders) {
        this.data.orders = window.OrdersModule.orders;
        console.log(`  ✅ Got ${this.data.orders.length} orders from OrdersModule`);
    }
    
    if (window.OrdersModule && window.OrdersModule.customers) {
        this.data.customers = window.OrdersModule.customers;
        console.log(`  ✅ Got ${this.data.customers.length} customers from OrdersModule`);
    }
    
    // ===== SECOND: Fallback to localStorage if modules don't have data =====
    if (this.data.transactions.length === 0) {
        try {
            const localData = localStorage.getItem('farm-transactions');
            if (localData) {
                this.data.transactions = JSON.parse(localData);
                console.log(`  📁 Fallback: Got ${this.data.transactions.length} transactions from localStorage`);
            }
        } catch (e) {}
    }
    
    if (this.data.sales.length === 0) {
        try {
            const localData = localStorage.getItem('farm-sales');
            if (localData) {
                this.data.sales = JSON.parse(localData);
                console.log(`  📁 Fallback: Got ${this.data.sales.length} sales from localStorage`);
            }
        } catch (e) {}
    }
    
    console.log('✅ Data load complete. Final counts:', {
        transactions: this.data.transactions.length,
        sales: this.data.sales.length,
        inventory: this.data.inventory.length,
        production: this.data.production.length,
        feed: this.data.feed.length,
        mortality: this.data.mortality.length,
        orders: this.data.orders.length,
        customers: this.data.customers.length
    });
},
    
    // ===== REAL-TIME LISTENERS =====
    
    setupRealtimeListeners(userId) {
        console.log('📡 Setting up real-time Firebase listeners...');
        
        // Listen for transaction changes
        db.collection('income').doc(userId).collection('transactions')
            .onSnapshot((snapshot) => {
                this.handleTransactionUpdate(snapshot);
            });
        
        // Listen for sales changes
        db.collection('sales').doc(userId).collection('records')
            .onSnapshot((snapshot) => {
                this.handleSalesUpdate(snapshot);
            });
        
        // Add more listeners as needed
    },
    
    handleTransactionUpdate(snapshot) {
        console.log('🔄 Transactions updated in Firebase');
        this.loadTransactions(firebase.auth().currentUser.uid);
        this._dispatchEvent('data-updated', { type: 'transactions' });
    },
    
    handleSalesUpdate(snapshot) {
        console.log('🔄 Sales updated in Firebase');
        this.loadSales(firebase.auth().currentUser.uid);
        this._dispatchEvent('data-updated', { type: 'sales' });
    },
    
    // ===== UTILITY METHODS =====
    
    getStats() {
        return {
            transactions: this.data.transactions.length,
            sales: this.data.sales.length,
            inventory: this.data.inventory.length,
            production: this.data.production.length,
            feed: this.data.feed.length,
            mortality: this.data.mortality.length,
            orders: this.data.orders.length,
            customers: this.data.customers.length
        };
    },
    
    getRecentActivities(limit = 20) {
        const activities = [];
        const now = new Date();
        
        // Add transactions
        this.data.transactions.forEach(t => {
            activities.push({
                id: `trans-${t.id || Date.now()}`,
                timestamp: t.date || t.createdAt || now.toISOString(),
                icon: t.type === 'income' ? '💰' : '💸',
                title: t.type === 'income' ? 'Income Recorded' : 'Expense Recorded',
                description: `${t.description || 'Transaction'} - $${t.amount || 0}`,
                module: 'income-expenses',
                data: t
            });
        });
        
        // Add sales
        this.data.sales.forEach(s => {
            activities.push({
                id: `sale-${s.id || Date.now()}`,
                timestamp: s.date || s.createdAt || now.toISOString(),
                icon: '🛒',
                title: 'Sale Completed',
                description: `${s.customerName || 'Customer'} - $${s.totalAmount || 0}`,
                module: 'sales',
                data: s
            });
        });
        
        // Add orders
        this.data.orders.forEach(o => {
            activities.push({
                id: `order-${o.id || Date.now()}`,
                timestamp: o.date || o.createdAt || now.toISOString(),
                icon: o.status === 'completed' ? '✅' : '📋',
                title: o.status === 'completed' ? 'Order Completed' : 'New Order',
                description: `Order #${o.id} - $${o.total || 0}`,
                module: 'orders',
                data: o
            });
        });
        
        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return activities.slice(0, limit);
    },
    
    // ===== EVENT DISPATCH =====
    
    _dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`farm-${eventName}`, { detail });
        window.dispatchEvent(event);
    },
    
    // ===== SUBSCRIBE TO CHANGES =====
    
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    },
    
    _notifyListeners(data) {
        this.listeners.forEach(cb => cb(data));
    }
};

// Make it global
window.DataService = DataService;

console.log('✅ Data Service ready');
