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
        
        // Dispatch loading event
        this._dispatchEvent('data-loading-started');
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No user logged in');
                this.isLoading = false;
                return false;
            }
            
            console.log(`👤 Loading data for user: ${user.uid}`);
            
            // Load all data in parallel
            await Promise.allSettled([
                this.loadTransactions(user.uid),
                this.loadSales(user.uid),
                this.loadInventory(user.uid),
                this.loadProduction(user.uid),
                this.loadFeed(user.uid),
                this.loadMortality(user.uid),
                this.loadOrders(user.uid),
                this.loadCustomers(user.uid)
            ]);
            
            // Also load from localStorage as fallback/backup
            this.loadFromLocalStorage();
            
            this.lastLoadTime = new Date().toISOString();
            this.isLoading = false;
            
            // Make data globally available
            window.FarmData = this.data;
            
            // Update FarmModules for compatibility
            if (!window.FarmModules) window.FarmModules = {};
            if (!window.FarmModules.appData) window.FarmModules.appData = {};
            window.FarmModules.appData = this.data;
            
            console.log('✅ Data Service initialized with:', this.getStats());
            
            // Dispatch loaded event
            this._dispatchEvent('data-loaded', this.data);
            
            // Set up real-time listeners
            this.setupRealtimeListeners(user.uid);
            
            return true;
            
        } catch (error) {
            console.error('❌ Data Service initialization error:', error);
            this.isLoading = false;
            this._dispatchEvent('data-error', error);
            return false;
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
        console.log('💾 Loading localStorage fallback data...');
        
        const localStorageKeys = {
            transactions: 'farm-transactions',
            sales: 'farm-sales',
            inventory: 'farm-inventory',
            production: 'farm-production',
            feed: 'farm-feed-records',
            mortality: 'farm-mortality-records',
            orders: 'farm-orders'
        };
        
        Object.entries(localStorageKeys).forEach(([key, storageKey]) => {
            try {
                const data = localStorage.getItem(storageKey);
                if (data && (!this.data[key] || this.data[key].length === 0)) {
                    this.data[key] = JSON.parse(data);
                    console.log(`  ✅ Loaded ${key} from localStorage`);
                }
            } catch (e) {
                // Ignore
            }
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
