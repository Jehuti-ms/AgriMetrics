// simple-remember.js - Simple Remember Me functionality
console.log('🔐 Loading Simple Remember Me...');

class SimpleRemember {
    constructor() {
        this.STORAGE_KEY = 'farm_system_remember_email';
        this.init();
    }
    
    init() {
        console.log('✅ Simple Remember Me initializing...');
        
        // Load saved email when page loads
        this.loadSavedEmail();
        
        // Save email when sign-in form is submitted
        this.setupFormListener();
        
        // Listen for logout events
        this.setupLogoutListener();
        
        console.log('✅ Simple Remember Me ready');
    }
    
    loadSavedEmail() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const email = JSON.parse(saved);
                const emailInput = document.getElementById('signin-email');
                const rememberCheckbox = document.getElementById('remember-me');
                
                if (emailInput && email) {
                    emailInput.value = email;
                    console.log('📧 Loaded saved email:', email);
                }
                
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                    console.log('✓ Remember me checkbox auto-checked');
                }
            } else {
                console.log('ℹ️ No saved email found');
            }
        } catch (error) {
            console.log('❌ Error loading saved email:', error);
        }
    }
    
    setupFormListener() {
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', () => {
                this.saveEmail();
            });
            console.log('📝 Form listener attached');
        } else {
            console.log('⚠️ Sign-in form not found, will retry...');
            // Try again after a delay
            setTimeout(() => this.setupFormListener(), 500);
        }
    }
    
    setupLogoutListener() {
        // Method 1: Listen for logout confirm button clicks
        document.addEventListener('click', (e) => {
            // Check for logout confirm button in modal
            if (e.target.id === 'logout-confirm' || e.target.closest('#logout-confirm')) {
                console.log('🖱️ Logout confirm button clicked');
                this.handleLogout();
            }
            
            // Check for navbar logout button
            if (e.target.id === 'navbar-logout-btn' || e.target.closest('#navbar-logout-btn')) {
                console.log('🖱️ Navbar logout button clicked');
                this.handleLogout();
            }
            
            // Check for any logout buttons with class
            if (e.target.classList.contains('logout-btn') || e.target.closest('.logout-btn')) {
                console.log('🖱️ Generic logout button clicked');
                this.handleLogout();
            }
        });
        
        console.log('👂 Logout listeners attached');
    }
    
    saveEmail() {
        const rememberCheckbox = document.getElementById('remember-me');
        const emailInput = document.getElementById('signin-email');
        
        if (rememberCheckbox && rememberCheckbox.checked && emailInput && emailInput.value) {
            // Save only email (never password!)
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(emailInput.value));
            console.log('💾 Saved email for remember me:', emailInput.value);
        } else {
            // Clear if checkbox is not checked
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🧹 Cleared remember me email (checkbox unchecked)');
        }
    }
    
    handleLogout() {
        const rememberCheckbox = document.getElementById('remember-me');
        
        // Only clear if checkbox exists and is NOT checked
        if (rememberCheckbox && !rememberCheckbox.checked) {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🗑️ Cleared remember me email on logout');
        } else {
            console.log('💾 Keeping remember me email (checkbox is checked)');
        }
    }
    
    // Public method to clear email manually if needed
    clearEmail() {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('🗑️ Manually cleared remember me email');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.SimpleRemember = new SimpleRemember();
});

console.log('🔐 Simple Remember Me script loaded');
