// firebase/firebase-firestore.js
console.log('Loading Firestore service...');

class FirestoreService {
    constructor() {
        this.db = null;
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            console.log('✅ Firestore service initialized');
        } else {
            console.log('⚠️ Firestore not available');
        }
    }

    // Get user profile
    async getUserProfile(userId) {
        if (!this.db) {
            throw new Error('Firestore not available');
        }
        
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            return doc;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // Create user profile
    async createUserProfile(userId, profileData) {
        if (!this.db) {
            throw new Error('Firestore not available');
        }
        
        try {
            await this.db.collection('users').doc(userId).set({
                ...profileData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error creating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile
    async updateUserProfile(userId, profileData) {
        if (!this.db) {
            throw new Error('Firestore not available');
        }
        
        try {
            await this.db.collection('users').doc(userId).update({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync farm data to Firestore
    async syncFarmData(userId, dataType, data) {
        if (!this.db) {
            throw new Error('Firestore not available');
        }
        
        try {
            const batch = this.db.batch();
            const collectionRef = this.db.collection('users').doc(userId).collection(dataType);
            
            // Clear existing data
            const snapshot = await collectionRef.get();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            // Add new data
            data.forEach((item) => {
                const docRef = collectionRef.doc(item.id || this.generateId());
                batch.set(docRef, {
                    ...item,
                    syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Error syncing farm data:', error);
            return { success: false, error: error.message };
        }
    }

    // Load farm data from Firestore
    async loadFarmData(userId, dataType) {
        if (!this.db) {
            throw new Error('Firestore not available');
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection(dataType)
                .orderBy('syncedAt', 'desc')
                .get();
                
            const data = [];
            snapshot.forEach((doc) => {
                data.push(doc.data());
            });
            return data;
        } catch (error) {
            console.error('Error loading farm data:', error);
            return [];
        }
    }

    // Generate ID for Firestore documents
    generateId() {
        return this.db.collection('temp').doc().id;
    }

    // Real-time data synchronization
    setupRealtimeSync(userId, dataType, callback) {
        if (!this.db) {
            console.error('Firestore not available for real-time sync');
            return () => {}; // Return empty unsubscribe function
        }
        
        return this.db
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
            }, (error) => {
                console.error('Real-time sync error:', error);
            });
    }
}

// Initialize Firestore service
window.firestoreService = new FirestoreService();
