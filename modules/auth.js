// app.js
const App = {
    currentUser: null,
    currentSection: 'dashboard',
    modules: {},

    init() {
        console.log('🚀 Initializing Farm Management System...');
        
        // Initialize Firebase Auth
        this.initAuth();
        
        // Initialize module framework
        this.initModules();
        
        // Check auth state
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.handleSignIn(user);
            } else {
                this.handleSignOut();
            }
        });
    },

    initAuth() {
        // Auth will be handled by auth.js module
        console.log('✅ Auth system ready');
    },

    initModules() {
        // Register all modules
        this.modules = window.FarmModules.getModules();
        console.log('📦 Registered modules:', Object.keys(this.modules));
    },

    handleSignIn(user) {
        console.log('👤 User signed in:', user.email);
        this.currentUser = user;
        
        // Show app, hide auth
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Initialize navigation
        if (window.coreModule) {
            window.coreModule.setupNavigation();
        }
        
        // Show dashboard by default
        this.showSection('dashboard');
        
        // Show welcome notification
        if (window.coreModule) {
            window.coreModule.showNotification(`Welcome back, ${user.displayName || user.email}!`, 'success');
        }
    },

    handleSignOut() {
        console.log('👤 User signed out');
        this.currentUser = null;
        
        // Show auth, hide app
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
        
        // Reset to signin form
        if (window.authModule) {
            window.authModule.showSignInForm();
        }
    },

    showSection(section) {
        console.log('🔄 Switching to section:', section);
        
        // Close side menu on mobile
        if (window.coreModule) {
            window.coreModule.closeSideMenu();
        }

        // Update content area with proper top padding
        const contentArea = document.getElementById('content-area');
        contentArea.style.paddingTop = '80px'; // Account for fixed navbar
        contentArea.style.minHeight = 'calc(100vh - 80px)';

        // Hide all modules
        Object.keys(this.modules).forEach(moduleName => {
            const module = this.modules[moduleName];
            if (module.initialized) {
                // You could add a deactivate method if needed
            }
        });

        // Show selected module
        const targetModule = this.modules[section];
        if (targetModule) {
            this.currentSection = section;
            
            if (!targetModule.initialized) {
                targetModule.initialize();
            } else {
                // Re-render the module if it's already initialized
                if (targetModule.renderModule) {
                    targetModule.renderModule();
                }
            }
            
            // Update active navigation
            if (window.coreModule) {
                window.coreModule.setActiveNavItem(section);
            }
            
            console.log('✅ Loaded module:', section);
        } else {
            console.error('❌ Module not found:', section);
            this.showSection('dashboard'); // Fallback to dashboard
        }
    },

    getCurrentUser() {
        return this.currentUser;
    },

    getCurrentSection() {
        return this.currentSection;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make app globally available
window.app = App;
