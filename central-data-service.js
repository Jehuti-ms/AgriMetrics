// central-data-service.js - With Broadcaster Integration
console.log('🏢 Initializing Central Data Service...');

class CentralDataService {
    constructor() {
        this.db = null;
        this.userId = null;
        this.isInitialized = false;
        this.isListening = false;
        
        // Cache for all data types
        this.cache = {
            customers: [],
            orders: [],
            transactions: [],
            sales: [],
            inventory: [],
            production: [],
            feedRecords: [],
            mortality: []
        };
        
        // Queue for offline operations
        this.pendingOperations = [];
        
        console.log('🏢 Central Data Service created');
    }
    
    /**
     * Get the broadcaster instance
     */
    getBroadcaster() {
        return window.Broadcaster || null;
    }
    
    /**
     * Broadcast event using the existing Broadcaster
     */
    broadcast(eventName, data) {
        const broadcaster = this.getBroadcaster();
        
        if (broadcaster && typeof broadcaster.broadcast === 'function') {
            // Use the existing Broadcaster
            broadcaster.broadcast(eventName, data);
            console.log(`📡 Broadcasted: ${eventName}`);
        } else {
            // Fallback to custom events
            window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
            console.log(`📡 Dispatched custom event: ${eventName}`);
        }
    }
    
    /**
     * Initialize the service
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('Central Data Service already initialized');
            return;
        }
        
        console.log('🚀 Initializing Central Data Service...');
        
        // Get Firebase instances
        this.db = window.db || (window.firebase && window.firebase.firestore());
        
        if (!this.db) {
            console.error('❌ Firestore not available!');
            return;
        }
        
        // Listen for auth changes
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(async (user) => {
                const newUserId = user ? user.uid : null;
                
                if (newUserId && newUserId !== this.userId) {
                    console.log('👤 User changed:', newUserId);
                    this.userId = newUserId;
                    await this.loadAllData();
                    this.startRealtimeListeners();
                    
                    // Broadcast user authenticated
                    this.broadcast('user-authenticated', { userId: this.userId });
                    
                } else if (!newUserId) {
                    console.log('👤 User logged out');
                    this.userId = null;
                    this.clearCache();
                    
                    // Broadcast user logged out
                    this.broadcast('user-logged-out', {});
                }
            });
            
            // Check if already logged in
            const currentUser = window.firebase.auth().currentUser;
            if (currentUser) {
                this.userId = currentUser.uid;
                await this.loadAllData();
                this.startRealtimeListeners();
            }
        }
        
        // Load cached data from localStorage
        this.loadFromLocalStorage();
        
        this.isInitialized = true;
        console.log('✅ Central Data Service initialized');
        
        // Broadcast that service is ready
        this.broadcast('central-data-ready', { timestamp: new Date().toISOString() });
        
        // Process any pending offline operations
        await this.processPendingOperations();
    }
    
    /**
     * Load all data from Firebase
     */
    async loadAllData() {
        if (!this.db || !this.userId) {
            console.warn('Cannot load data: No Firestore or user ID');
            return;
        }
        
        console.log('📥 Loading all data from Firebase...');
        
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        
        for (const collection of collections) {
            await this.loadCollection(collection);
        }
        
        console.log('✅ All data loaded from Firebase');
        
        // Broadcast that all data is loaded
        this.broadcast('all-data-loaded', { 
            collections: Object.keys(this.cache).reduce((acc, key) => {
                acc[key] = this.cache[key].length;
                return acc;
            }, {}),
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Load a specific collection from Firebase
     */
    async loadCollection(collectionName) {
        if (!this.db || !this.userId) return;
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .get();
            
            const items = [];
            snapshot.forEach(doc => {
                items.push(doc.data());
            });
            
            this.cache[collectionName] = items;
            this.saveToLocalStorage(collectionName);
            
            console.log(`  📥 Loaded ${items.length} ${collectionName}`);
            
            // Broadcast collection loaded
            this.broadcast(`${collectionName}-loaded`, items);
            
        } catch (error) {
            console.error(`Error loading ${collectionName}:`, error);
            // Fallback to localStorage
            const cached = localStorage.getItem(`farm-${collectionName}`);
            if (cached) {
                this.cache[collectionName] = JSON.parse(cached);
                console.log(`  📁 Using cached ${collectionName} from localStorage`);
            }
        }
    }
    
    /**
     * Save ANY data to Firebase (universal method)
     */
    async save(collectionName, data, customId = null) {
        if (!collectionName) {
            console.error('❌ save() requires collectionName');
            return { success: false, error: 'No collection name provided' };
        }
        
        const docId = customId || data.id || Date.now().toString();
        const docData = {
            ...data,
            id: docId,
            updatedAt: new Date().toISOString()
        };
        
        if (!data.createdAt) {
            docData.createdAt = new Date().toISOString();
        }
        
        // If offline, queue the operation
        if (!this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing save for ${collectionName}`);
            this.pendingOperations.push({
                type: 'save',
                collection: collectionName,
                data: docData,
                id: docId
            });
            this.updateLocalCache(collectionName, docData);
            
            // Broadcast offline save
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('offline-operation-queued', { collection: collectionName, operation: 'save', id: docId });
            
            return { success: false, offline: true, id: docId };
        }
        
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .doc(docId.toString())
                .set(docData);
            
            // Update cache
            this.updateLocalCache(collectionName, docData);
            
            console.log(`✅ Saved ${collectionName} to Firebase:`, docId);
            
            // Broadcast the update to all modules via Broadcaster
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('data-saved', { 
                collection: collectionName, 
                action: 'save', 
                data: docData,
                timestamp: new Date().toISOString()
            });
            
            // Also broadcast specific events for modules that listen for them
            if (collectionName === 'customers') {
                this.broadcast('customer-added', docData);
            } else if (collectionName === 'orders') {
                this.broadcast('order-created', docData);
            } else if (collectionName === 'sales') {
                this.broadcast('sale-recorded', docData);
            }
            
            return { success: true, id: docId, data: docData };
            
        } catch (error) {
            console.error(`Error saving ${collectionName}:`, error);
            this.updateLocalCache(collectionName, docData);
            return { success: false, error: error };
        }
    }
    
    /**
     * Delete ANY data from Firebase
     */
    async delete(collectionName, id) {
        if (!collectionName || !id) {
            console.error('❌ delete() requires collectionName and id');
            return { success: false };
        }
        
        // If offline, queue the operation
        if (!this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing delete for ${collectionName}`);
            this.pendingOperations.push({
                type: 'delete',
                collection: collectionName,
                id: id
            });
            this.deleteFromLocalCache(collectionName, id);
            
            // Broadcast offline delete
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('offline-operation-queued', { collection: collectionName, operation: 'delete', id: id });
            
            return { success: false, offline: true };
        }
        
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .doc(id.toString())
                .delete();
            
            // Update cache
            this.deleteFromLocalCache(collectionName, id);
            
            console.log(`✅ Deleted ${collectionName} from Firebase:`, id);
            
            // Broadcast the update to all modules
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('data-deleted', { 
                collection: collectionName, 
                id: id,
                timestamp: new Date().toISOString()
            });
            
            // Also broadcast specific events
            if (collectionName === 'customers') {
                this.broadcast('customer-deleted', { customerId: id });
            } else if (collectionName === 'orders') {
                this.broadcast('order-deleted', { orderId: id });
            }
            
            return { success: true };
            
        } catch (error) {
            console.error(`Error deleting ${collectionName}:`, error);
            return { success: false, error: error };
        }
    }
    
    /**
     * Update ANY data in Firebase
     */
    async update(collectionName, id, updates) {
        if (!collectionName || !id) {
            console.error('❌ update() requires collectionName and id');
            return { success: false };
        }
        
        // If offline, queue the operation
        if (!this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing update for ${collectionName}`);
            this.pendingOperations.push({
                type: 'update',
                collection: collectionName,
                id: id,
                updates: updates
            });
            this.updateLocalCache(collectionName, { id, ...updates });
            
            // Broadcast offline update
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('offline-operation-queued', { collection: collectionName, operation: 'update', id: id });
            
            return { success: false, offline: true };
        }
        
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .doc(id.toString())
                .update({
                    ...updates,
                    updatedAt: new Date().toISOString()
                });
            
            // Update cache
            this.updateLocalCache(collectionName, { id, ...updates });
            
            console.log(`✅ Updated ${collectionName} in Firebase:`, id);
            
            // Broadcast the update to all modules
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('data-updated', { 
                collection: collectionName, 
                id: id,
                updates: updates,
                timestamp: new Date().toISOString()
            });
            
            return { success: true };
            
        } catch (error) {
            console.error(`Error updating ${collectionName}:`, error);
            return { success: false, error: error };
        }
    }
    
    /**
     * Get data from cache (no network call)
     */
    get(collectionName) {
        return this.cache[collectionName] || [];
    }
    
    /**
     * Get a single item by ID
     */
    getById(collectionName, id) {
        const collection = this.cache[collectionName] || [];
        return collection.find(item => item.id == id);
    }
    
    /**
     * Start real-time listeners for all collections
     */
    startRealtimeListeners() {
        if (this.isListening || !this.db || !this.userId) return;
        
        console.log('🔄 Starting real-time Firebase listeners...');
        
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        
        collections.forEach(collection => {
            this.db
                .collection('users')
                .doc(this.userId)
                .collection(collection)
                .onSnapshot((snapshot) => {
                    const items = [];
                    snapshot.forEach(doc => {
                        items.push(doc.data());
                    });
                    
                    const oldCount = this.cache[collection]?.length || 0;
                    this.cache[collection] = items;
                    this.saveToLocalStorage(collection);
                    
                    if (oldCount !== items.length) {
                        console.log(`🔄 Real-time update: ${collection} (${items.length} items)`);
                        
                        // Broadcast real-time update via Broadcaster
                        this.broadcast(`${collection}-updated`, items);
                        this.broadcast('realtime-update', { 
                            collection: collection, 
                            count: items.length,
                            timestamp: new Date().toISOString()
                        });
                    }
                }, (error) => {
                    console.error(`Error in real-time listener for ${collection}:`, error);
                });
        });
        
        this.isListening = true;
        console.log('✅ Real-time listeners active');
        
        // Broadcast that real-time listeners are active
        this.broadcast('realtime-listeners-active', { collections: collections });
    }
    
    /**
     * Save collection to localStorage
     */
    saveToLocalStorage(collectionName) {
        if (this.cache[collectionName]) {
            localStorage.setItem(`farm-${collectionName}`, JSON.stringify(this.cache[collectionName]));
        }
    }
    
    /**
     * Load all collections from localStorage
     */
    loadFromLocalStorage() {
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        
        collections.forEach(collection => {
            const cached = localStorage.getItem(`farm-${collection}`);
            if (cached) {
                this.cache[collection] = JSON.parse(cached);
                console.log(`📁 Loaded ${this.cache[collection].length} ${collection} from localStorage cache`);
            }
        });
    }
    
    /**
     * Update local cache
     */
    updateLocalCache(collectionName, data) {
        if (!this.cache[collectionName]) {
            this.cache[collectionName] = [];
        }
        
        const index = this.cache[collectionName].findIndex(item => item.id == data.id);
        if (index !== -1) {
            this.cache[collectionName][index] = { ...this.cache[collectionName][index], ...data };
        } else {
            this.cache[collectionName].push(data);
        }
        
        this.saveToLocalStorage(collectionName);
    }
    
    /**
     * Delete from local cache
     */
    deleteFromLocalCache(collectionName, id) {
        if (this.cache[collectionName]) {
            this.cache[collectionName] = this.cache[collectionName].filter(item => item.id != id);
            this.saveToLocalStorage(collectionName);
        }
    }
    
    /**
     * Clear all caches
     */
    clearCache() {
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        collections.forEach(collection => {
            this.cache[collection] = [];
        });
        console.log('🗑️ Cache cleared');
    }
    
    /**
     * Process pending offline operations
     */
    async processPendingOperations() {
        if (!this.db || !this.userId || this.pendingOperations.length === 0) return;
        
        console.log(`🔄 Processing ${this.pendingOperations.length} pending operations...`);
        
        const operations = [...this.pendingOperations];
        this.pendingOperations = [];
        
        for (const op of operations) {
            console.log(`  Processing: ${op.type} ${op.collection}`);
            
            switch (op.type) {
                case 'save':
                    await this.save(op.collection, op.data, op.id);
                    break;
                case 'delete':
                    await this.delete(op.collection, op.id);
                    break;
                case 'update':
                    await this.update(op.collection, op.id, op.updates);
                    break;
            }
        }
        
        // Broadcast that offline operations are complete
        this.broadcast('offline-operations-complete', { count: operations.length });
        
        console.log('✅ All pending operations processed');
    }
    
    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            isOnline: !!(this.db && this.userId),
            pendingOperations: this.pendingOperations.length,
            collections: Object.keys(this.cache).reduce((acc, key) => {
                acc[key] = this.cache[key].length;
                return acc;
            }, {})
        };
    }
}

// Create and expose global instance
window.CentralDataService = new CentralDataService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.CentralDataService.initialize();
    });
} else {
    window.CentralDataService.initialize();
}

console.log('✅ Central Data Service ready with Broadcaster integration!');
