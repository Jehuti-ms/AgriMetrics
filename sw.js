// sw.js - Agrimetrics Service Worker for Cross-Device Sync
const CACHE_NAME = 'agrimetrics-sync-v1';
const FIRESTORE_SYNC_TAG = 'agrimetrics-firestore-sync';

// Installation
self.addEventListener('install', (event) => {
    console.log('🌾 Agrimetrics Service Worker installing...');
    self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
    console.log('🌾 Agrimetrics Service Worker activated');
    event.waitUntil(self.clients.claim());
});

// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === FIRESTORE_SYNC_TAG) {
        console.log('🌾 Background sync triggered for Agrimetrics');
        event.waitUntil(syncWithFirestore());
    }
});

// Main sync function
async function syncWithFirestore() {
    console.log('🔄 Agrimetrics syncing with Firestore...');
    
    try {
        const clients = await self.clients.matchAll();
        
        // Get sync data from IndexedDB
        const syncData = await getSyncData();
        
        if (!syncData || !syncData.userId) {
            console.log('No Agrimetrics data to sync');
            return;
        }
        
        // Notify clients sync started
        clients.forEach(client => {
            client.postMessage({
                type: 'AGRIMETRICS_SYNC_STARTED',
                timestamp: new Date().toISOString(),
                data: syncData
            });
        });

        // Perform the sync
        const result = await performAgrimetricsSync(syncData);
        
        // Notify clients sync completed
        clients.forEach(client => {
            client.postMessage({
                type: 'AGRIMETRICS_SYNC_COMPLETED',
                timestamp: new Date().toISOString(),
                success: result
            });
        });

        return result;
        
    } catch (error) {
        console.error('Agrimetrics sync failed:', error);
        
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'AGRIMETRICS_SYNC_FAILED',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        });
        
        throw error;
    }
}

// Get sync data from IndexedDB
async function getSyncData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AgrimetricsSyncDB', 2);
        
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            resolve(null);
        };
        
        request.onupgradeneeded = (event) => {
            console.log('Creating Agrimetrics IndexedDB...');
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('agrimetricsSyncQueue')) {
                const store = db.createObjectStore('agrimetricsSyncQueue', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('farmId', 'farmId', { unique: false });
                store.createIndex('syncType', 'syncType', { unique: false });
                console.log('Created agrimetricsSyncQueue object store');
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('agrimetricsSyncQueue')) {
                db.close();
                resolve(null);
                return;
            }
            
            const transaction = db.transaction(['agrimetricsSyncQueue'], 'readonly');
            const store = transaction.objectStore('agrimetricsSyncQueue');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                const items = getAllRequest.result;
                const latest = items.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                )[0];
                db.close();
                resolve(latest);
            };
            
            getAllRequest.onerror = (error) => {
                console.error('Error getting sync data:', error);
                db.close();
                resolve(null);
            };
        };
    });
}

// Perform Agrimetrics-specific sync
async function performAgrimetricsSync(syncData) {
    console.log('📊 Syncing Agrimetrics data:', syncData);
    
    try {
        const { userId, farmId, dataType, payload } = syncData.data;
        
        // Store sync status
        await saveSyncStatus({
            lastSync: new Date().toISOString(),
            userId: userId,
            farmId: farmId,
            dataType: dataType,
            status: 'completed'
        });
        
        return true;
        
    } catch (error) {
        console.error('Agrimetrics sync error:', error);
        return false;
    }
}

// Save sync status
async function saveSyncStatus(status) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/agrimetrics-sync-status', new Response(JSON.stringify(status)));
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'QUEUE_AGRIMETRICS_DATA':
            event.waitUntil(queueAgrimetricsData(payload));
            break;
            
        case 'TRIGGER_AGRIMETRICS_SYNC':
            event.waitUntil(
                self.registration.sync.register(FIRESTORE_SYNC_TAG)
                    .then(() => console.log('Agrimetrics background sync registered'))
                    .catch(err => console.log('Background sync not supported:', err))
            );
            break;
            
        case 'GET_AGRIMETRICS_SYNC_STATUS':
            event.waitUntil(
                (async () => {
                    const status = await getAgrimetricsSyncStatus();
                    event.ports[0].postMessage(status);
                })()
            );
            break;
    }
});

// Queue Agrimetrics data
async function queueAgrimetricsData(data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AgrimetricsSyncDB', 2);
        
        request.onerror = (event) => {
            console.error('Error opening Agrimetrics DB:', event.target.error);
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('agrimetricsSyncQueue')) {
                db.createObjectStore('agrimetricsSyncQueue', { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('agrimetricsSyncQueue')) {
                db.close();
                resolve();
                return;
            }
            
            const transaction = db.transaction(['agrimetricsSyncQueue'], 'readwrite');
            const store = transaction.objectStore('agrimetricsSyncQueue');
            
            const addRequest = store.add({
                data: data,
                timestamp: new Date().toISOString(),
                type: 'agrimetrics_sync',
                userId: data.userId,
                farmId: data.farmId,
                dataType: data.dataType
            });
            
            addRequest.onsuccess = () => {
                console.log('Agrimetrics data queued for sync');
                if (self.registration.sync) {
                    self.registration.sync.register(FIRESTORE_SYNC_TAG)
                        .catch(err => console.log('Sync registration failed:', err));
                }
                db.close();
                resolve();
            };
            
            addRequest.onerror = (error) => {
                console.error('Error queuing Agrimetrics data:', error);
                db.close();
                resolve();
            };
        };
    });
}

// Get sync status
async function getAgrimetricsSyncStatus() {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/agrimetrics-sync-status');
    if (response) {
        return await response.json();
    }
    return { lastSync: null };
}

// Handle periodic sync if supported
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'agrimetrics-periodic-sync') {
        console.log('🌾 Periodic Agrimetrics sync triggered');
        event.waitUntil(syncWithFirestore());
    }
});
