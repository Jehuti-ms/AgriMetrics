// unified-data-service.js - Single Source of Truth
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
    
    /**
     * Setup network detection for offline support
     */
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
    
    /**
     * Initialize the service
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('Unified Data Service already initialized');
            return;
        }
        
        console.log('🚀 Initializing Unified Data Service...');
        
        // Get Firebase instances
        this.db = window.db || (window.firebase && window.firebase.firestore());
        
        if (!this.db) {
            console.error('❌ Firestore not available!');
            // Still initialize with localStorage only
            this.loadFromLocalStorage();
            this.isInitialized = true;
            return;
        }
        
        // Listen for auth changes
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(async (user) => {
                const newUserId = user ? user.uid : null;
                
                if (newUserId && newUserId !== this.userId) {
                    console.log('👤 User changed:', newUserId);
                    this.userId = newUserId;
                    
                    // Load data from both sources and merge
                    await this.loadAllData();
                    
                    // Setup realtime listeners
                    this.startRealtimeListeners();
                    
                    // Process any pending offline operations
                    await this.processOfflineQueue();
                    
                    // Broadcast user authenticated
                    this.broadcast('user-authenticated', { userId: this.userId });
                    
                } else if (!newUserId) {
                    console.log('👤 User logged out');
                    this.userId = null;
                    this.clearCache();
                    this.stopRealtimeListeners();
                    
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
        
        // Load offline queue
        this.loadOfflineQueue();
        
        this.isInitialized = true;
        console.log('✅ Unified Data Service initialized');
        
        // Broadcast that service is ready
        this.broadcast('unified-data-ready', { 
            timestamp: new Date().toISOString(),
            online: this.isOnline,
            userId: this.userId
        });
    }
    
    /**
     * Load all data from Firebase and merge with localStorage
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
     * Load a specific collection from Firebase and merge with localStorage
     */
    async loadCollection(collectionName) {
        if (!this.db || !this.userId) return;
        
        try {
            // Get Firebase data
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .get();
            
            const firebaseItems = [];
            snapshot.forEach(doc => {
                firebaseItems.push({ id: doc.id, ...doc.data() });
            });
            
            // Get localStorage data
            const localItems = this.cache[collectionName] || [];
            
            // Merge: Firebase takes precedence, but keep local if newer
            const mergedMap = new Map();
            
            // Add Firebase items first
            firebaseItems.forEach(item => {
                mergedMap.set(item.id.toString(), {
                    ...item,
                    source: 'firebase',
                    lastSynced: new Date().toISOString()
                });
            });
            
            // Add local items (only if not in Firebase or local is newer)
            localItems.forEach(item => {
                const existing = mergedMap.get(item.id.toString());
                if (!existing) {
                    mergedMap.set(item.id.toString(), {
                        ...item,
                        source: 'local'
                    });
                } else if (item.updatedAt && existing.updatedAt && new Date(item.updatedAt) > new Date(existing.updatedAt)) {
                    // Local is newer, use it and queue for upload
                    mergedMap.set(item.id.toString(), {
                        ...item,
                        source: 'local',
                        needsUpload: true
                    });
                    this.queueForUpload(collectionName, item);
                }
            });
            
            // Update cache
            this.cache[collectionName] = Array.from(mergedMap.values());
            this.saveToLocalStorage(collectionName);
            
            console.log(`  📥 Loaded ${this.cache[collectionName].length} ${collectionName}`);
            
            // Broadcast collection loaded
            this.broadcast(`${collectionName}-loaded`, this.cache[collectionName]);
            
        } catch (error) {
            console.error(`Error loading ${collectionName}:`, error);
            // Keep localStorage data as fallback
            const cached = localStorage.getItem(`farm-${collectionName}`);
            if (cached) {
                this.cache[collectionName] = JSON.parse(cached);
                console.log(`  📁 Using cached ${collectionName} from localStorage`);
            }
        }
    }
    
    /**
     * Save ANY data (universal method with offline support)
     * Now handles both single items and arrays
     */
    async save(collectionName, data, customId = null) {
        if (!collectionName) {
            console.error('❌ save() requires collectionName');
            return { success: false, error: 'No collection name provided' };
        }
        
        // 🔥 NEW: Check if data is an array (for bulk operations like deleteArrayItem)
        if (Array.isArray(data)) {
            console.log(`📦 Saving entire array to ${collectionName} (${data.length} items)`);
            
            // If offline, queue the operation
            if (!this.isOnline || !this.db || !this.userId) {
                console.warn(`⚠️ Offline: Queuing array save for ${collectionName}`);
                
                this.queueOperation({
                    type: 'saveArray',
                    collection: collectionName,
                    data: data,
                    timestamp: new Date().toISOString()
                });
                
                // Update local cache immediately
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
                // Get reference to the collection
                const collectionRef = this.db
                    .collection('users')
                    .doc(this.userId)
                    .collection(collectionName);
                
                // Get all existing documents to delete old ones
                const existingDocs = await collectionRef.get();
                
                // Delete all existing documents
                const deletePromises = existingDocs.docs.map(doc => doc.ref.delete());
                await Promise.all(deletePromises);
                
                // Save each item in the array
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
                
                // Update cache
                this.cache[collectionName] = data;
                this.saveToLocalStorage(collectionName);
                
                console.log(`✅ Saved array to ${collectionName} (${data.length} items)`);
                
                // Broadcast the update
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
        
        // Original single-item save logic
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
        
        // If offline, queue the operation
        if (!this.isOnline || !this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing save for ${collectionName}`);
            
            this.queueOperation({
                type: 'save',
                collection: collectionName,
                data: docData,
                id: docId,
                timestamp: now
            });
            
            // Update local cache immediately
            this.updateLocalCache(collectionName, docData);
            
            // Broadcast offline save
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
            // Save to Firebase
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection(collectionName)
                .doc(docId.toString())
                .set(docData);
            
            // Update cache
            this.updateLocalCache(collectionName, docData);
            
            console.log(`✅ Saved ${collectionName} to Firebase:`, docId);
            
            // Broadcast the update to all modules
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('data-saved', { 
                collection: collectionName, 
                action: 'save', 
                data: docData,
                timestamp: now
            });
            
            // Broadcast specific events for backward compatibility
            this.broadcastSpecificEvent(collectionName, docData, 'created');
            
            return { success: true, id: docId, data: docData };
            
        } catch (error) {
            console.error(`Error saving ${collectionName}:`, error);
            
            // Queue for retry
            this.queueOperation({
                type: 'save',
                collection: collectionName,
                data: docData,
                id: docId,
                timestamp: now,
                error: error.message
            });
            
            // Still update local cache
            this.updateLocalCache(collectionName, docData);
            
            return { success: false, offline: true, id: docId, error: error.message };
        }
    }
    
    /**
     * Delete ANY data with offline support
     */
    async delete(collectionName, id) {
    if (!collectionName || !id) {
        console.error('❌ delete() requires collectionName and id');
        return { success: false };
    }
    
    // If offline, queue the operation
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
        // 🔥 CRITICAL: Delete the document from Firestore
        await this.db
            .collection('users')
            .doc(this.userId)
            .collection(collectionName)
            .doc(id.toString())
            .delete();
        
        // Update cache
        this.deleteFromLocalCache(collectionName, id);
        
        console.log(`✅ Deleted ${collectionName} from Firebase:`, id);
        
        // Broadcast the update
        this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
        this.broadcast('data-deleted', { 
            collection: collectionName, 
            id: id,
            timestamp: new Date().toISOString()
        });
        
        // Broadcast specific events
        this.broadcastSpecificEvent(collectionName, { id }, 'deleted');
        
        return { success: true };
        
    } catch (error) {
        console.error(`Error deleting ${collectionName}:`, error);
        
        // Queue for retry
        this.queueOperation({
            type: 'delete',
            collection: collectionName,
            id: id,
            timestamp: new Date().toISOString(),
            error: error.message
        });
        
        // Still update local cache
        this.deleteFromLocalCache(collectionName, id);
        
        return { success: false, offline: true, error: error.message };
    }
}
    
    /**
     * Delete an item from an array collection (handles the entire array)
     * This is the CENTRAL fix for the sync loop issue
     */
  async deleteArrayItem(collection, itemId, arrayPath = null) {
    console.log(`🗑️ Deleting ${itemId} from ${collection}`);
    
    try {
        // Get current data
        let currentData = this.get(collection);
        
        // Handle different data structures
        let updatedData;
        if (arrayPath && currentData[arrayPath]) {
            // For nested arrays like { items: [...] }
            updatedData = { ...currentData };
            updatedData[arrayPath] = updatedData[arrayPath].filter(item => item.id != itemId);  // ← Changed !== to !=
        } else if (Array.isArray(currentData)) {
            // For simple arrays like [...]
            updatedData = currentData.filter(item => item.id != itemId);  // ← Changed !== to !=
        } else {
            console.error('Cannot delete: data structure not recognized');
            return false;
        }
        
        // Save back to Firebase and localStorage (this overwrites the entire array)
        await this.save(collection, updatedData);
        console.log(`✅ Deleted ${itemId} from ${collection} - remaining: ${updatedData.length}`);
        return true;
        
    } catch (error) {
        console.error('Error in deleteArrayItem:', error);
        return false;
    }
}
    
    /**
     * Sync an entire array to Firebase (overwrites)
     */
    async syncArray(collection, data) {
        console.log(`🔄 Syncing ${collection} with`, data.length, 'items');
        
        try {
            // Save the entire array to Firebase (overwrites)
            await this.save(collection, data);
            
            // Update local cache
            this.updateLocalCache(collection, data);
            
            // Broadcast update
            this.broadcast(`${collection}-updated`, data);
            
            return true;
        } catch (error) {
            console.error('Error syncing array:', error);
            return false;
        }
    }
    
    /**
     * Update ANY data with offline support
     */
    async update(collectionName, id, updates) {
        if (!collectionName || !id) {
            console.error('❌ update() requires collectionName and id');
            return { success: false };
        }
        
        // If offline, queue the operation
        if (!this.isOnline || !this.db || !this.userId) {
            console.warn(`⚠️ Offline: Queuing update for ${collectionName}`);
            
            this.queueOperation({
                type: 'update',
                collection: collectionName,
                id: id,
                updates: updates,
                timestamp: new Date().toISOString()
            });
            
            this.updateLocalCache(collectionName, { id, ...updates });
            
            // Broadcast offline update
            this.broadcast(`${collectionName}-updated`, this.cache[collectionName]);
            this.broadcast('offline-operation-queued', { 
                collection: collectionName, 
                operation: 'update', 
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
            
            // Broadcast specific events
            this.broadcastSpecificEvent(collectionName, { id, ...updates }, 'updated');
            
            return { success: true };
            
        } catch (error) {
            console.error(`Error updating ${collectionName}:`, error);
            
            // Queue for retry
            this.queueOperation({
                type: 'update',
                collection: collectionName,
                id: id,
                updates: updates,
                timestamp: new Date().toISOString(),
                error: error.message
            });
            
            // Still update local cache
            this.updateLocalCache(collectionName, { id, ...updates });
            
            return { success: false, offline: true, error: error.message };
        }
    }
    
    /**
     * Queue operation for offline sync
     */
    queueOperation(operation) {
        this.offlineQueue.push(operation);
        this.saveOfflineQueue();
        this.updateSyncStatus();
    }
    
    /**
     * Save offline queue to localStorage
     */
    saveOfflineQueue() {
        try {
            localStorage.setItem('unified-offline-queue', JSON.stringify(this.offlineQueue));
        } catch (e) {
            console.warn('Failed to save offline queue:', e);
        }
    }
    
    /**
     * Load offline queue from localStorage
     */
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
    
    /**
     * Process all pending offline operations
     */
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
        
        // If there are still pending operations, try again after a delay
        if (this.offlineQueue.length > 0) {
            setTimeout(() => this.processOfflineQueue(), 30000);
        }
    }
    
    /**
     * Start real-time listeners for all collections
     */
    startRealtimeListeners() {
        if (!this.db || !this.userId) return;
        
        console.log('🔄 Starting real-time Firebase listeners...');
        
        const collections = ['customers', 'orders', 'transactions', 'sales', 'inventory', 'production', 'feedRecords', 'mortality'];
        
        collections.forEach(collection => {
            // Stop existing listener if any
            if (this.realtimeUnsubscribers.has(collection)) {
                this.realtimeUnsubscribers.get(collection)();
            }
            
            const unsubscribe = this.db
                .collection('users')
                .doc(this.userId)
                .collection(collection)
                .onSnapshot((snapshot) => {
                    const items = [];
                    snapshot.forEach(doc => {
                        items.push({ id: doc.id, ...doc.data() });
                    });
                    
                    const oldCount = this.cache[collection]?.length || 0;
                    
                    // Merge with local data (keep local if newer)
                    const localItems = this.cache[collection] || [];
                    const mergedMap = new Map();
                    
                    items.forEach(item => {
                        mergedMap.set(item.id.toString(), item);
                    });
                    
                    localItems.forEach(item => {
                        const existing = mergedMap.get(item.id.toString());
                        if (!existing) {
                            mergedMap.set(item.id.toString(), item);
                        } else if (item.updatedAt && existing.updatedAt && new Date(item.updatedAt) > new Date(existing.updatedAt)) {
                            mergedMap.set(item.id.toString(), item);
                        }
                    });
                    
                    this.cache[collection] = Array.from(mergedMap.values());
                    this.saveToLocalStorage(collection);
                    
                    if (oldCount !== this.cache[collection].length) {
                        console.log(`🔄 Real-time update: ${collection} (${this.cache[collection].length} items)`);
                        
                        // Broadcast real-time update
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
        
        console.log('✅ Real-time listeners active');
        
        // Broadcast that real-time listeners are active
        this.broadcast('realtime-listeners-active', { collections: collections });
    }
    
    /**
     * Stop all real-time listeners
     */
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
     * Broadcast specific events for backward compatibility
     */
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
    
    /**
     * Broadcast event using window events
     */
    broadcast(eventName, data) {
        // Use custom events
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        
        // Also use custom event on document for broader reach
        document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        
        console.log(`📡 Broadcasted: ${eventName}`);
    }
    
    /**
     * Subscribe to events
     */
    on(eventName, callback) {
        window.addEventListener(eventName, (event) => {
            callback(event.detail);
        });
    }
    
    /**
     * Update sync status in UI
     */
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
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use core module if available
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Get sync status
     */
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
    
    /**
     * Force sync now
     */
    async syncNow() {
        console.log('🔄 Force sync requested');
        this.broadcast('sync-requested', { timestamp: new Date().toISOString() });
        await this.processOfflineQueue();
        return this.getSyncStatus();
    }
}

// Create and expose global instance
window.UnifiedDataService = new UnifiedDataService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UnifiedDataService.initialize();
    });
} else {
    window.UnifiedDataService.initialize();
}

console.log('✅ Unified Data Service ready!');
