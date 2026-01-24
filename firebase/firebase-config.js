// Firebase Configuration - MINIMAL WORKING VERSION
const firebaseConfig = {
    apiKey: "AIzaSyAO37tTin-BEBEXZNBtWbl57-s2UZAQxL8",
    authDomain: "agrimetrics-a316c.firebaseapp.com",
    projectId: "agrimetrics-a316c",
    storageBucket: "agrimetrics-a316c.firebasestorage.app",
    messagingSenderId: "464595577104",
    appId: "1:464595577104:web:5e24c30c38c7b7c6e45d95",
    measurementId: "G-KQW4GMBDVY"
};

// Initialize Firebase if it exists
if (typeof firebase !== 'undefined') {
    try {
        // Initialize app if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized');
        } else {
            console.log('✅ Firebase already initialized');
        }
        
        // Make services available globally
        window.firebaseAuth = firebase.auth();
        window.db = firebase.firestore();
        window.storage = firebase.storage();
        
        console.log('Firebase services loaded');
        
    } catch (error) {
        console.error('Firebase init error:', error);
    }
}
