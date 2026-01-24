// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAO37tTin-BEBEXZNBtWbl57-s2UZAQxL8",
    authDomain: "agrimetrics-a316c.firebaseapp.com",
    projectId: "agrimetrics-a316c",
    storageBucket: "agrimetrics-a316c.firebasestorage.app",
    messagingSenderId: "464595577104",
    appId: "1:464595577104:web:5e24c30c38c7b7c6e45d95",
    measurementId: "G-KQW4GMBDVY"
};

// Enhanced initialization with debugging
if (typeof firebase !== 'undefined') {
    try {
        console.log('🔧 Initializing Firebase (Compat v9.22.0)...');
        console.log('Current domain:', window.location.hostname);
        console.log('Protocol:', window.location.protocol);
        console.log('Full URL:', window.location.href);
        
        // Check if we're using file:// protocol (won't work)
        if (window.location.protocol === 'file:') {
            console.error('❌ Firebase cannot work with file:// protocol!');
            console.error('Please run a local server:');
            console.error('  - npx serve .');
            console.error('  - python -m http.server 8000');
            alert('ERROR: Please run this through a local server (http://localhost), not by opening the file directly.');
            return;
        }
        
        let app;
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } else {
            app = firebase.apps[0];
            console.log('✅ Firebase already initialized');
        }
        
        // Initialize ALL Firebase services (Compat API)
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage(); // This requires firebase-storage-compat.js
        
        // Make them globally available
        window.firebase = firebase;
        window.firebaseAuth = auth;
        window.db = db;
        window.storage = storage;
        
        console.log('Project ID:', app.options.projectId);
        console.log('Auth Domain:', app.options.authDomain);
        console.log('Firebase Auth available:', !!auth);
        console.log('Firestore available:', !!db);
        console.log('Storage available:', !!storage);
        
        // Test Firestore connection (optional)
        if (db && db.enablePersistence) {
            db.enablePersistence().catch((err) => {
                console.log('Firestore persistence:', err.code);
            });
        }
        
        console.log('📋 Firebase Configuration:');
        console.log('- API Key configured:', !!firebaseConfig.apiKey);
        console.log('- Auth Domain:', firebaseConfig.authDomain);
        console.log('- Project ID:', firebaseConfig.projectId);
        console.log('- Firestore ready:', !!db);
        console.log('- Storage ready:', !!storage);
        console.log('- Using Compat version: true');
        
        // Dispatch event that Firebase is ready
        window.dispatchEvent(new CustomEvent('firebase-ready'));
        
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Show user-friendly error
        if (error.code === 'auth/configuration-not-found') {
            alert('Firebase configuration error. Please check your firebase-config.js file.');
        }
    }
} else {
    console.error('❌ Firebase SDK not loaded!');
    console.error('Make sure you have these scripts in your HTML:');
    console.error('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>');
    console.error('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>');
    console.error('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>');
    console.error('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>');
}
