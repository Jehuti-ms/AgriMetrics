// Firestore Service
const FirestoreService = {
    // Get user profile
    getUserProfile: function(userId) {
        return firebase.firestore().collection('users').doc(userId).get();
    },

    // Create user profile
    createUserProfile: function(userId, profileData) {
        return firebase.firestore().collection('users').doc(userId).set(profileData);
    },

    // Update user profile
    updateUserProfile: function(userId, profileData) {
        return firebase.firestore().collection('users').doc(userId).update({
            ...profileData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    // Sync farm data to Firestore
    syncFarmData: function(userId, dataType, data) {
        const batch = firebase.firestore().batch();
        const collectionRef = firebase.firestore().collection('users').doc(userId).collection(dataType);
        
        // Clear existing data and add new data
        return collectionRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            data.forEach((item) => {
                const docRef = collectionRef.doc(item.id || FirestoreService.generateId());
                batch.set(docRef, {
                    ...item,
                    syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            return batch.commit();
        });
    },

    // Load farm data from Firestore
    loadFarmData: function(userId, dataType) {
        return firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection(dataType)
            .orderBy('syncedAt', 'desc')
            .get()
            .then((snapshot) => {
                const data = [];
                snapshot.forEach((doc) => {
                    data.push(doc.data());
                });
                return data;
            });
    },

    // Generate ID for Firestore documents
    generateId: function() {
        return firebase.firestore().collection('temp').doc().id;
    },

    // Real-time data synchronization
    setupRealtimeSync: function(userId, dataType, callback) {
        return firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection(dataType)
            .orderBy('syncedAt', 'desc')
            .onSnapshot((snapshot) => {
                const data = [];
                snapshot.forEach((doc) => {
                    data.push(doc.data());
                });
                callback(data);
            });
    }
};

// Auto-sync Manager
const AutoSyncManager = {
    isOnline: navigator.onLine,
    pendingSyncs: [],
    syncInProgress: false,

    init: function() {
        // Listen for online/offline events
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Listen for auth state changes
        FirebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.setupAutoSync(user.uid);
            }
        });
    },

    handleOnline: function() {
        this.isOnline = true;
        this.showSyncStatus('Syncing data...', 'syncing');
        this.processPendingSyncs();
    },

    handleOffline: function() {
        this.isOnline = false;
        this.showSyncStatus('You are offline', 'error');
    },

    setupAutoSync: function(userId) {
        // Set up real-time listeners for all data types
        const dataTypes = ['inventory', 'transactions', 'production', 'orders', 'sales', 'projects', 'feedRecords'];
        
        dataTypes.forEach(dataType => {
            FirestoreService.setupRealtimeSync(userId, dataType, (data) => {
                if (data.length > 0) {
                    FarmModules.appData[dataType] = data;
                    FarmModules.saveDataToStorage();
                    
                    // Update UI if module is active
                    const activeModule = document.querySelector('.section.active').id;
                    if (FarmModules.modules[activeModule] && FarmModules.modules[activeModule].renderHistory) {
                        FarmModules.modules[activeModule].renderHistory();
                    }
                }
            });
        });
    },

    queueSync: function(userId, dataType, data) {
        if (!this.isOnline) {
            this.pendingSyncs.push({ userId, dataType, data });
            this.showSyncStatus('Changes saved locally (offline)', 'syncing');
            return;
        }

        this.syncData(userId, dataType, data);
    },

    syncData: function(userId, dataType, data) {
        if (this.syncInProgress) {
            setTimeout(() => this.syncData(userId, dataType, data), 1000);
            return;
        }

        this.syncInProgress = true;
        this.showSyncStatus('Syncing data...', 'syncing');

        FirestoreService.syncFarmData(userId, dataType, data)
            .then(() => {
                this.showSyncStatus('Data synced successfully', 'success');
                setTimeout(() => this.hideSyncStatus(), 3000);
            })
            .catch((error) => {
                console.error('Sync error:', error);
                this.showSyncStatus('Sync failed', 'error');
                // Queue for retry
                this.pendingSyncs.push({ userId, dataType, data });
            })
            .finally(() => {
                this.syncInProgress = false;
            });
    },

    processPendingSyncs: function() {
        if (this.pendingSyncs.length === 0 || !this.isOnline) return;

        const sync = this.pendingSyncs.shift();
        this.syncData(sync.userId, sync.dataType, sync.data);
        
        // Process next sync after a delay
        setTimeout(() => this.processPendingSyncs(), 1000);
    },

    showSyncStatus: function(message, type) {
        const syncStatus = document.getElementById('syncStatus');
        const syncMessage = document.getElementById('syncMessage');
        
        if (syncStatus && syncMessage) {
            syncStatus.className = `sync-status ${type}`;
            syncMessage.textContent = message;
        }
    },

    hideSyncStatus: function() {
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.style.display = 'none';
        }
    }
};
