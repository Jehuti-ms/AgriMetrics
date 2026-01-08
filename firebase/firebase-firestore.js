// firebase-firestore-fixed.js
const FirestoreService = {
    getUserProfile(userId) {
        return firebase.firestore().collection('users').doc(userId).get();
    },
    updateUserProfile(userId, profileData) {
        return firebase.firestore().collection('users').doc(userId).update({
            ...profileData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },
    setupRealtimeSync(userId, dataType, callback) {
        return firebase.firestore()
            .collection('users').doc(userId).collection(dataType)
            .orderBy('syncedAt', 'desc')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => doc.data());
                callback(data);
            });
    }
};

const AutoSyncManager = {
    init() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        if (window.authManager) {
            window.authManager.onAuthStateChanged(user => {
                if (user) this.setupAutoSync(user.uid);
            });
        }
    },
    handleOnline() { console.log('Online, syncing data...'); },
    handleOffline() { console.log('Offline, changes queued.'); },
    setupAutoSync(userId) {
        ['inventory','transactions','production','orders','sales','projects','feedRecords']
            .forEach(type => FirestoreService.setupRealtimeSync(userId, type, data => {
                console.log(`Realtime update for ${type}`, data);
            }));
    }
};
