// auth-diagnostic.js
console.log('🔍 AUTH DIAGNOSTIC TOOL LOADING...');

// Check Firebase configuration
function diagnoseFirebaseConfig() {
    console.group('🔧 Firebase Configuration Check');
    
    if (!window.firebase || !window.firebase.auth) {
        console.error('❌ Firebase SDK not loaded');
        console.groupEnd();
        return false;
    }
    
    const auth = window.firebase.auth();
    console.log('✅ Firebase Auth available');
    
    // Check Firebase app
    try {
        const app = firebase.app();
        console.log('✅ Firebase App initialized');
        console.log('Project ID:', app.options.projectId);
        console.log('Auth Domain:', app.options.authDomain);
    } catch (error) {
        console.error('❌ Firebase App error:', error);
    }
    
    console.groupEnd();
    return true;
}

// Check if user exists
async function checkUserExists(email) {
    console.group('👤 User Existence Check');
    
    if (!email) {
        console.warn('⚠️ No email provided');
        console.groupEnd();
        return null;
    }
    
    try {
        const auth = firebase.auth();
        const methods = await auth.fetchSignInMethodsForEmail(email);
        
        console.log(`Email: ${email}`);
        console.log('Sign-in methods available:', methods);
        
        if (methods.length === 0) {
            console.error('❌ No account found with this email');
            console.groupEnd();
            return null;
        }
        
        console.log('✅ Account exists with methods:', methods.join(', '));
        console.groupEnd();
        return methods;
        
    } catch (error) {
        console.error('❌ Error checking user:', error);
        console.groupEnd();
        return null;
    }
}

// Test sign-in with detailed error analysis
async function testSignIn(email, password) {
    console.group('🔐 Test Sign-in');
    console.log(`Testing: ${email}`);
    
    const auth = firebase.auth();
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ SIGN-IN SUCCESS!');
        console.log('User:', {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            emailVerified: userCredential.user.emailVerified,
            isAnonymous: userCredential.user.isAnonymous
        });
        console.groupEnd();
        return userCredential;
        
    } catch (error) {
        console.error('❌ SIGN-IN FAILED');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        
        // Detailed error analysis
        switch (error.code) {
            case 'auth/invalid-email':
                console.warn('💡 Fix: Use a valid email format (user@example.com)');
                break;
                
            case 'auth/user-disabled':
                console.warn('💡 Fix: Account disabled in Firebase Console');
                console.warn('Go to: Firebase Console → Authentication → Users');
                break;
                
            case 'auth/user-not-found':
                console.warn('💡 Fix: No account exists. Create one first.');
                break;
                
            case 'auth/wrong-password':
            case 'auth/invalid-login-credentials':
                console.warn('💡 Fix: Incorrect password');
                console.warn('Try: Reset password or check caps lock');
                break;
                
            case 'auth/too-many-requests':
                console.warn('💡 Fix: Too many attempts. Wait 15 minutes.');
                break;
                
            case 'auth/network-request-failed':
                console.warn('💡 Fix: Check internet connection');
                break;
                
            default:
                console.warn('💡 Fix: Unknown error - check Firebase Console');
        }
        
        console.groupEnd();
        throw error;
    }
}

// Create a test user (for debugging)
async function createTestUser(email, password) {
    console.group('👷 Create Test User');
    
    const auth = firebase.auth();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ USER CREATED SUCCESSFULLY!');
        console.log('User UID:', userCredential.user.uid);
        
        // Send verification email
        await userCredential.user.sendEmailVerification();
        console.log('✅ Verification email sent');
        
        console.groupEnd();
        return userCredential;
        
    } catch (error) {
        console.error('❌ CREATE USER FAILED:', error.code, error.message);
        
        if (error.code === 'auth/email-already-in-use') {
            console.warn('⚠️ Email already in use');
            await checkUserExists(email);
        }
        
        console.groupEnd();
        throw error;
    }
}

// Reset password
async function resetUserPassword(email) {
    console.group('🔄 Password Reset');
    
    try {
        const auth = firebase.auth();
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent to:', email);
        console.groupEnd();
        return true;
    } catch (error) {
        console.error('❌ Reset failed:', error);
        console.groupEnd();
        return false;
    }
}

// Check localStorage for auth data
function checkLocalStorage() {
    console.group('💾 LocalStorage Check');
    
    const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('firebase') || key.includes('auth') || key.includes('user')
    );
    
    if (authKeys.length === 0) {
        console.log('No auth data in localStorage');
    } else {
        authKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                console.log(key + ':', JSON.parse(value));
            } catch {
                console.log(key + ':', localStorage.getItem(key));
            }
        });
    }
    
    console.groupEnd();
}

// Export functions to window for console access
window.authDiagnostic = {
    diagnose: diagnoseFirebaseConfig,
    checkUser: checkUserExists,
    testSignIn: testSignIn,
    createUser: createTestUser,
    resetPassword: resetUserPassword,
    checkStorage: checkLocalStorage,
    
    // Run all diagnostics
    runAll: async function(email = null) {
        console.log('🚀 RUNNING COMPLETE AUTH DIAGNOSTICS');
        
        // Check Firebase
        this.diagnose();
        
        // Check localStorage
        this.checkStorage();
        
        // If email provided, check user
        if (email) {
            await this.checkUser(email);
        }
        
        console.log('📊 DIAGNOSTICS COMPLETE');
    }
};

// Auto-run basic diagnostics
setTimeout(() => {
    console.log('🔍 Auto-running auth diagnostics...');
    authDiagnostic.diagnose();
    authDiagnostic.checkStorage();
}, 2000);

console.log('✅ Auth Diagnostic Tool Ready');
console.log('💡 Use authDiagnostic.runAll("user@example.com") in console');
