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
        console.log('🔧 Initializing Firebase...');
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
        }
        
        if (!firebase.apps.length) {
            const app = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
            console.log('Project ID:', app.options.projectId);
            console.log('Auth Domain:', app.options.authDomain);
            
            // Test authentication availability
            const auth = firebase.auth();
            console.log('Firebase Auth available:', !!auth);
            
        } else {
            console.log('✅ Firebase already initialized');
            const app = firebase.apps[0];
            console.log('Project ID:', app.options.projectId);
            console.log('Auth Domain:', app.options.authDomain);
        }
        
        // Log all authorized domains from config
        console.log('📋 Firebase Configuration:');
        console.log('- API Key configured:', !!firebaseConfig.apiKey);
        console.log('- Auth Domain:', firebaseConfig.authDomain);
        console.log('- Project ID:', firebaseConfig.projectId);
        
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
    console.log('⚠️ Firebase SDK not loaded');
    console.log('Make sure you have these scripts in your HTML:');
    console.log('<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>');
    console.log('<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"></script>');
    console.log('<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"></script>');
}
