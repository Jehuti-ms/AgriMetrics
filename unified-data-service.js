// unified-data-service.js - Single Source of Truth (REPLACE MODE)
console.log('🏢 Initializing Unified Data Service...');

class UnifiedDataService {
    constructor() {
        this.db = null;
        this.userId = null;
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.realtimeUnsubscribers = new Map();
        
        // Single cache for all data types
        this.cache = {
            customers: [],
            orders: [],
            transactions: [],
            sales: [],
            inventory: [],
            production: [],
            feedRecords: [],
            feedInventory: [],
            mortality: []
        };
        
        // Track pending sync operations
        this.isSyncing = false;
        
        // Setup network listeners
        this.setupNetworkDetection();
        
        console.log('🏢 Unified Data Service created');
    }
    
    setupNetworkDetection() {
        window.addEventListener('online', () => {
            console.log('🌐 Device came online');
            this.isOnline = true;
            this.processOfflineQueue();
            this.showNotification('Back online! Syncing data...', 'info');
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Device went offline');
            this.isOnline = false;
            this.showNotification('You are offline. Changes saved locally.', 'warning');
        });
    }
    
    async initialize() {
        if (this.isInitialized) {
            console.log('Unified Data Service already initialized');
            return;
        }
        
        console.log('🚀 Initializing Unified Data Service...');
        
        this.db = window.db || (window.firebase && window.firebase.firestore());
        
        if (!this.db) {
            console.error('❌ Firestore not available!');
            this.loadFromLocalStorage();
            this.isInitialized = true;
            return;
        }
        
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(async (user) => {
                const newUserId = user ? user.uid : null;
                
                if (newUserId && newUserId !== this.userId) {
                    console.log('👤 User changed:', newUserId);
                    this.userId = newUserId;
                    await this.loadAllData();
                    this.startRealtimeListeners();
                    await this.processOfflineQueue();
                    this.broadcast('user-authenticated', { userId: this.userId });
                    
                } else if (!newUserId) {
                    console.log('👤 User logged out');
                    this.userId = null;
                    this.clearCache();
                    this.stopRealtimeListeners();
                    this.broadcast('user-logged-out', {});
                }
            });
            
            const currentUser = window.firebase.auth().currentUser;
            if (currentUser) {
                this.userId = currentUser.uid;
                await this.loadAllData();
                this.startRealtimeListeners();
            }
        }
        
        this.loadFromLocalStorage();
        this.loadOfflineQueue();
        
        this.isInitialized = true;
        console.log('✅ Unified Data Service initialized');
        
        this.broadcast('unified-data-ready', { 
            timestamp: new Date().toISOString(),
            online: this.isOnline,
            userId: this.userId
        });
    }
    
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
        
        this.broadcast('all-data-loaded', { 
            collections: Object.keys(this.cache).reduce((acc, key) => {
                acc[key] = this.cache[key].length;
                return acc;
            }, {}),
            timestamp: new Date().toISOString()
        });
    }
    
    async loadCollection(collectionName) {
        if (!this.db || !this.userId) return;
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .get();
            
            const firebaseItems = [];
            snapshot.forEach(doc => {
                firebaseItems.push({ id: doc.id, ...doc.data() });
            });
            
            // 🔥 REPLACE - NOT MERGE
            this.cache[collectionName] = firebaseItems;
            this.saveToLocalStorage(collectionName);
            
            console.log(`  📥 Loaded ${this.cache[collectionName].length} ${collectionName} (REPLACED)`);
            
            this.broadcast(`${collectionName}-loaded`, this.cache[collectionName]);
            
        } catch (error) {
            console.error(`Error loading ${collectionName}:`, error);
            const cached = localStorage.getItem(`farm-${collectionName}`);
            if (cached) {
                this.cache[collectionName] = JSON.parse(cached);
                console.log(`  📁 Using cached ${collectionName} from localStorage`);
            }
        }
    }
    
    async save(collectionName, data, customId = null) {
        if (!collectionName) {
            console.error('❌ save() requires collectionName');
            return { success: false, error: 'No collection name provided' };
        }
        
        // Handle array saves (bulk operations)
        if (Array.isArray(data)) {
            console.log(`📦 Saving entire array to ${collectionName} (${data.length} items)`);
            
            if (!this.isOnline || !this.db || !this.userId) {
                console.warn(`⚠️ Offline: Queuing array save for ${collectionName}`);
                
                this.queueOperation({
                    type: 'saveArray',
                    collection: collectionName,
                    data: data,
                    timestamp: new Date().toISOString()
                });
                
                this.cache[collectionName] = data;
                this.saveToLocalStorage(collectionName);
                
                this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
                this.broadcast('offline-operation-queued', { 
                    collection: collectionName, 
                    operation: 'saveArray',
                    itemCount: data.length,
                    queueLength: this.offlineQueue.length
                });
                
                return { success: true, offline: true, queued: true };
            }
            
            try {
                const collectionRef = this.db
                    .collection('users')
                    .doc(this.userId)
                    .collection(collectionName);
                
                const existingDocs = await collectionRef.get();
                const deletePromises = existingDocs.docs.map(doc => doc.ref.delete());
                await Promise.all(deletePromises);
                
                const savePromises = data.map(item => {
                    const docId = item.id || Date.now().toString();
                    return collectionRef.doc(docId.toString()).set({
                        ...item,
                        id: docId,
                        updatedAt: new Date().toISOString(),
                        createdAt: item.createdAt || new Date().toISOString()
                    });
                });
                
                await Promise.all(savePromises);
                
                this.cache[collectionName] = data;
                this.saveToLocalStorage(collectionName);
                
                console.log(`✅ Saved array to ${collectionName} (${data.length} items)`);
                
                this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
                this.broadcast('data-saved', { 
                    collection: collectionName, 
                    action: 'saveArray',
                    itemCount: data.length,
                    timestamp: new Date().toISOString()
                });
                
                return { success: true, itemCount: data.length };
                
            } catch (error) {
                console.error(`Error saving array to ${collectionName}:`, error);
                return { success: false, error: error.message };
            }
        }
        
        // Single item save
        const docId = customId || data.id || Date.now().toString();
        const now = new Date().toISOString();
        
        const docData = {
            ...data,
            id: docId,
            updatedAt: now
        };
        
        if (!data.createdAt) {
            docData.createdAt = now;
        }
        
        if (!this.isOnline || !this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing save for ${collectionName}`);
            
            this.queueOperation({
                type: 'save',
                collection: collectionName,
                data: docData,
                id: docId,
                timestamp: now
            });
            
            this.updateLocalCache(collectionName, docData);
            
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('offline-operation-queued', { 
                collection: collectionName, 
                operation: 'save', 
                id: docId,
                queueLength: this.offlineQueue.length
            });
            
            return { success: true, offline: true, id: docId, queued: true };
        }
        
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .doc(docId.toString())
                .set(docData);
            
            this.updateLocalCache(collectionName, docData);
            
            console.log(`✅ Saved ${collectionName} to Firebase:`, docId);
            
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('data-saved', { 
                collection: collectionName, 
                action: 'save', 
                data: docData,
                timestamp: now
            });
            
            this.broadcastSpecificEvent(collectionName, docData, 'created');
            
            return { success: true, id: docId, data: docData };
            
        } catch (error) {
            console.error(`Error saving ${collectionName}:`, error);
            
            this.queueOperation({
                type: 'save',
                collection: collectionName,
                data: docData,
                id: docId,
                timestamp: now,
                error: error.message
            });
            
            this.updateLocalCache(collectionName, docData);
            
            return { success: false, offline: true, id: docId, error: error.message };
        }
    }
    
    async delete(collectionName, id) {
        if (!collectionName || !id) {
            console.error('❌ delete() requires collectionName and id');
            return { success: false };
        }
        
        if (!this.isOnline || !this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing delete for ${collectionName}`);
            
            this.queueOperation({
                type: 'delete',
                collection: collectionName,
                id: id,
                timestamp: new Date().toISOString()
            });
            
            this.deleteFromLocalCache(collectionName, id);
            
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('offline-operation-queued', { 
                collection: collectionName, 
                operation: 'delete', 
                id: id,
                queueLength: this.offlineQueue.length
            });
            
            return { success: true, offline: true, queued: true };
        }
        
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .doc(id.toString())
                .delete();
            
            this.deleteFromLocalCache(collectionName, id);
            
            console.log(`✅ Deleted ${collectionName} from Firebase:`, id);
            
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('data-deleted', { 
                collection: collectionName, 
                id: id,
                timestamp: new Date().toISOString()
            });
            
            this.broadcastSpecificEvent(collectionName, { id }, 'deleted');
            
            return { success: true };
            
        } catch (error) {
            console.error(`Error deleting ${collectionName}:`, error);
            
            this.queueOperation({
                type: 'delete',
                collection: collectionName,
                id: id,
                timestamp: new Date().toISOString(),
                error: error.message
            });
            
            this.deleteFromLocalCache(collectionName, id);
            
            return { success: false, offline: true, error: error.message };
        }
    }
    
    startRealtimeListeners() {
        if (!this.db || !this.userId) return;
        
        console.log('🔄 Starting real-time Firebase listeners (REPLACE MODE)...');
        
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        
        collections.forEach(collection => {
            if (this.realtimeUnsubscribers.has(collection)) {
                this.realtimeUnsubscribers.get(collection)();
            }
            
            const unsubscribe = this.db
                .collection('users')
                .doc(this.userId)
                .collection(collection)
                .onSnapshot((snapshot) => {
                    // 🔥 DIRECT REPLACE - NO MERGING
                    const items = [];
                    snapshot.forEach(doc => {
                        items.push({ id: doc.id, ...doc.data() });
                    });
                    
                    const oldCount = this.cache[collection]?.length || 0;
                    
                    // REPLACE the entire cache
                    this.cache[collection] = items;
                    this.saveToLocalStorage(collection);
                    
                    if (oldCount !== this.cache[collection].length) {
                        console.log(`🔄 Real-time update: ${collection} (${this.cache[collection].length} items) - REPLACED`);
                        
                        this.broadcast(`${collection}-updated`, this.cache[collection]);
                        this.broadcast('realtime-update', { 
                            collection: collection, 
                            count: this.cache[collection].length,
                            timestamp: new Date().toISOString()
                        });
                    }
                }, (error) => {
                    console.error(`Error in real-time listener for ${collection}:`, error);
                });
            
            this.realtimeUnsubscribers.set(collection, unsubscribe);
        });
        
        console.log('✅ Real-time listeners active (REPLACE MODE)');
        this.broadcast('realtime-listeners-active', { collections: collections });
    }
    
    stopRealtimeListeners() {
        console.log('🛑 Stopping real-time listeners...');
        
        this.realtimeUnsubscribers.forEach((unsubscribe, collection) => {
            try {
                unsubscribe();
                console.log(`  Stopped listener for ${collection}`);
            } catch (error) {
                console.warn(`Error stopping listener for ${collection}:`, error);
            }
        });
        
        this.realtimeUnsubscribers.clear();
    }
    
    saveToLocalStorage(collectionName) {
        if (this.cache[collectionName]) {
            localStorage.setItem(`farm-${collectionName}`, JSON.stringify(this.cache[collectionName]));
        }
    }
    
    loadFromLocalStorage() {
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        
        collections.forEach(collection => {
            const cached = localStorage.getItem(`farm-${collection}`);
            if (cached) {
                try {
                    this.cache[collection] = JSON.parse(cached);
                    console.log(`📁 Loaded ${this.cache[collection].length} ${collection} from localStorage cache`);
                } catch (e) {
                    console.warn(`Failed to parse ${collection} from localStorage:`, e);
                    this.cache[collection] = [];
                }
            } else {
                this.cache[collection] = [];
            }
        });
    }
    
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
    
    deleteFromLocalCache(collectionName, id) {
        if (this.cache[collectionName]) {
            this.cache[collectionName] = this.cache[collectionName].filter(item => item.id != id);
            this.saveToLocalStorage(collectionName);
        }
    }
    
    clearCache() {
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        collections.forEach(collection => {
            this.cache[collection] = [];
        });
        console.log('🗑️ Cache cleared');
    }
    
    get(collectionName) {
        return this.cache[collectionName] || [];
    }
    
    getById(collectionName, id) {
        const collection = this.cache[collectionName] || [];
        return collection.find(item => item.id == id);
    }
    
    queueOperation(operation) {
        this.offlineQueue.push(operation);
        this.saveOfflineQueue();
        this.updateSyncStatus();
    }
    
    saveOfflineQueue() {
        try {
            localStorage.setItem('unified-offline-queue', JSON.stringify(this.offlineQueue));
        } catch (e) {
            console.warn('Failed to save offline queue:', e);
        }
    }
    
    loadOfflineQueue() {
        try {
            const saved = localStorage.getItem('unified-offline-queue');
            if (saved) {
                this.offlineQueue = JSON.parse(saved);
                console.log(`📦 Loaded ${this.offlineQueue.length} pending operations from offline queue`);
            }
        } catch (e) {
            console.warn('Failed to load offline queue:', e);
            this.offlineQueue = [];
        }
    }
    
    async processOfflineQueue() {
        if (!this.isOnline || !this.db || !this.userId || this.offlineQueue.length === 0) {
            return;
        }
        
        if (this.isSyncing) {
            console.log('Sync already in progress, will retry later');
            return;
        }
        
        this.isSyncing = true;
        console.log(`🔄 Processing ${this.offlineQueue.length} pending operations...`);
        
        this.broadcast('sync-started', { 
            pendingCount: this.offlineQueue.length,
            timestamp: new Date().toISOString()
        });
        
        const operations = [...this.offlineQueue];
        this.offlineQueue = [];
        this.saveOfflineQueue();
        
        let successCount = 0;
        let failCount = 0;
        
        for (const op of operations) {
            console.log(`  Processing: ${op.type} ${op.collection}`);
            
            try {
                let result;
                switch (op.type) {
                    case 'save':
                        result = await this.save(op.collection, op.data, op.id);
                        break;
                    case 'saveArray':
                        result = await this.save(op.collection, op.data);
                        break;
                    case 'delete':
                        result = await this.delete(op.collection, op.id);
                        break;
                    case 'update':
                        result = await this.update(op.collection, op.id, op.updates);
                        break;
                    default:
                        console.warn(`Unknown operation type: ${op.type}`);
                        continue;
                }
                
                if (result && result.success !== false) {
                    successCount++;
                    console.log(`  ✅ ${op.type} succeeded`);
                } else {
                    this.offlineQueue.push(op);
                    failCount++;
                    console.log(`  ❌ ${op.type} failed, re-queued`);
                }
            } catch (error) {
                console.error(`  Failed to process ${op.type}:`, error);
                this.offlineQueue.push(op);
                failCount++;
            }
        }
        
        this.saveOfflineQueue();
        this.isSyncing = false;
        
        console.log(`✅ Sync complete: ${successCount} succeeded, ${failCount} failed, ${this.offlineQueue.length} remaining`);
        
        this.broadcast('sync-completed', {
            successCount: successCount,
            failCount: failCount,
            pendingRemaining: this.offlineQueue.length,
            timestamp: new Date().toISOString()
        });
        
        this.updateSyncStatus();
        
        if (this.offlineQueue.length > 0) {
            setTimeout(() => this.processOfflineQueue(), 30000);
        }
    }
    
    broadcastSpecificEvent(collectionName, data, action) {
        const eventMap = {
            customers: { created: 'customer-added', updated: 'customer-updated', deleted: 'customer-deleted' },
            orders: { created: 'order-created', updated: 'order-updated', deleted: 'order-deleted' },
            sales: { created: 'sale-recorded', updated: 'sale-updated', deleted: 'sale-deleted' },
            transactions: { created: 'transaction-created', updated: 'transaction-updated', deleted: 'transaction-deleted' }
        };
        
        const event = eventMap[collectionName]?.[action];
        if (event) {
            this.broadcast(event, data);
        }
    }
    
    broadcast(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        console.log(`📡 Broadcasted: ${eventName}`);
    }
    
    on(eventName, callback) {
        window.addEventListener(eventName, (event) => {
            callback(event.detail);
        });
    }
    
    updateSyncStatus() {
        const statusElement = document.getElementById('unified-sync-status');
        if (!statusElement) return;
        
        const statusDot = statusElement.querySelector('.sync-dot');
        const statusText = statusElement.querySelector('.sync-text');
        
        if (!statusDot || !statusText) return;
        
        if (!this.isOnline) {
            statusDot.className = 'sync-dot offline';
            statusText.textContent = this.offlineQueue.length > 0 ? `${this.offlineQueue.length} pending` : 'Offline';
        } else if (this.offlineQueue.length > 0) {
            statusDot.className = 'sync-dot syncing';
            statusText.textContent = `Syncing (${this.offlineQueue.length})`;
        } else {
            statusDot.className = 'sync-dot online';
            statusText.textContent = 'Connected';
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            isAuthenticated: !!(this.db && this.userId),
            pendingOperations: this.offlineQueue.length,
            collections: Object.keys(this.cache).reduce((acc, key) => {
                acc[key] = this.cache[key].length;
                return acc;
            }, {})
        };
    }
    
    async syncNow() {
        console.log('🔄 Force sync requested');
        this.broadcast('sync-requested', { timestamp: new Date().toISOString() });
        await this.processOfflineQueue();
        return this.getSyncStatus();
    }
}

window.UnifiedDataService = new UnifiedDataService();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UnifiedDataService.initialize();
    });
} else {
    window.UnifiedDataService.initialize();
}

console.log('✅ Unified Data Service ready!');
