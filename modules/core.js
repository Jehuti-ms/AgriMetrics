// modules/core.js - Core functionality and utilities
if (typeof window.coreModule === 'undefined') {
    class CoreModule {
        constructor() {
            this.app = window.app;
            this.init();
        }

        init() {
            console.log('Core module initialized');
            this.setupGlobalErrorHandling();
            this.setupOfflineDetection();
        }

        setupGlobalErrorHandling() {
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                this.showNotification('An error occurred. Please try again.', 'error');
            });

            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                this.showNotification('Something went wrong. Please refresh the page.', 'error');
            });
        }

        setupOfflineDetection() {
            window.addEventListener('online', () => {
                this.showNotification('Connection restored', 'success');
            });

            window.addEventListener('offline', () => {
                this.showNotification('You are offline. Some features may not work.', 'warning');
            });
        }

        showNotification(message, type = 'info') {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.createNotification(message, type);
                });
            } else {
                this.createNotification(message, type);
            }
        }

        createNotification(message, type) {
            if (!document.body) {
                console.log(`[${type}] ${message}`);
                return;
            }

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">&times;</button>
            `;

            // Add styles if not already added
            if (!document.querySelector('#notification-styles')) {
                const styles = `
                    <style>
                        .notification {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            padding: 1rem 1.5rem;
                            border-radius: 8px;
                            color: white;
                            z-index: 1000;
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                            max-width: 400px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            animation: slideIn 0.3s ease-out;
                        }
                        .notification-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
                        .notification-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                        .notification-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
                        .notification-info { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
                        .notification button {
                            background: none;
                            border: none;
                            color: white;
                            font-size: 1.2rem;
                            cursor: pointer;
                            padding: 0;
                            width: 20px;
                            height: 20px;
                        }
                        @keyframes slideIn {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    </style>
                `;
                document.head.insertAdjacentHTML('beforeend', styles);
            }

            document.body.appendChild(notification);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }

        formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        }

        formatDate(date) {
            try {
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (e) {
                return 'Invalid date';
            }
        }

        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        async loadData(collection, docId = null) {
            try {
                if (!firebase.firestore) {
                    throw new Error('Firestore not available');
                }
                
                const db = firebase.firestore();
                let data;

                if (docId) {
                    const doc = await db.collection(collection).doc(docId).get();
                    data = doc.exists ? doc.data() : null;
                } else {
                    const snapshot = await db.collection(collection).get();
                    data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }

                return { success: true, data };
            } catch (error) {
                console.error(`Error loading data from ${collection}:`, error);
                return { success: false, error: error.message };
            }
        }

        async saveData(collection, data, docId = null) {
            try {
                if (!firebase.firestore) {
                    throw new Error('Firestore not available');
                }

                const db = firebase.firestore();
                const timestamp = firebase.firestore.FieldValue.serverTimestamp();

                const dataToSave = {
                    ...data,
                    updatedAt: timestamp
                };

                if (!docId) {
                    dataToSave.createdAt = timestamp;
                }

                const ref = docId ? 
                    db.collection(collection).doc(docId) : 
                    db.collection(collection).doc();

                await ref.set(dataToSave, { merge: true });

                return { success: true, id: ref.id };
            } catch (error) {
                console.error(`Error saving data to ${collection}:`, error);
                return { success: false, error: error.message };
            }
        }

        async deleteData(collection, docId) {
            try {
                if (!firebase.firestore) {
                    throw new Error('Firestore not available');
                }

                await firebase.firestore().collection(collection).doc(docId).delete();
                return { success: true };
            } catch (error) {
                console.error(`Error deleting data from ${collection}:`, error);
                return { success: false, error: error.message };
            }
        }
    }

    // Initialize core module when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.coreModule = new CoreModule();
        });
    } else {
        window.coreModule = new CoreModule();
    }
}
