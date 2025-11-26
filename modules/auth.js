// In modules/auth.js - FIX UI METHODS
updateUIForAuthState(isSignedIn) {
    console.log('🔄 Updating UI for auth state:', isSignedIn);
    
    const authForms = document.querySelector('.auth-forms');
    const appContent = document.querySelector('.app-content');
    
    if (authForms) {
        authForms.style.display = isSignedIn ? 'none' : 'block';
        console.log('Auth forms display:', authForms.style.display);
    }
    
    if (appContent) {
        appContent.style.display = isSignedIn ? 'block' : 'none';
        console.log('App content display:', appContent.style.display);
    }
}
