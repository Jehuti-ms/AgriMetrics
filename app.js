// app.js - MINIMAL WORKING VERSION
console.log('🚜 Farm Management PWA - Minimal version');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - forcing app to show');
    
    // Force show everything for now
    const authForms = document.querySelector('.auth-forms');
    const appContent = document.querySelector('.app-content');
    
    if (authForms) {
        console.log('Found auth forms');
        authForms.style.display = 'none';
    }
    
    if (appContent) {
        console.log('Found app content');
        appContent.style.display = 'block';
    }
    
    console.log('App should be visible now');
});
