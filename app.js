// app.js
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Starting Farm Management App...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeApp();
                });
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async initializeApp() {
        try {
            // Check Firebase availability
            if (this.isFirebaseAvailable()) {
                console.log('✅ Firebase is available');
                this.setupAuthListener();
            } else {
                console.log('🔄 Running in demo mode');
                this.isDemoMode = true;
                this.setupDemoMode();
            }
            
            this.setupEventListeners();
            
            console.log('✅ Farm Management App initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.isDemoMode = true;
            this.setupDemoMode();
            this.setupEventListeners();
        }
    }

    isFirebaseAvailable() {
        return typeof firebase !== 'undefined' && 
               firebase.apps && 
               firebase.apps.length > 0 &&
               firebase.auth;
    }

    setupAuthListener() {
        if (!this.isFirebaseAvailable()) {
            this.setupDemoMode();
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showApp();
                this.loadUserData();
            } else {
                this.currentUser = null;
                this.showAuth();
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            this.setupDemoMode();
        });
    }

    setupDemoMode() {
        console.log('🏠 Setting up demo mode');
        this.isDemoMode = true;
        this.showApp();
    }

    setupEventListeners() {
        // Listen for bottom navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                this.showSection(view);
            }
            
            // Also handle sidebar navigation if you keep it
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            }
        });

        console.log('✅ Event listeners setup complete');
    }

    showAuth() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        // Add bottom navigation
        this.createBottomNavigation();
        
        // Update user info
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            if (this.currentUser) {
                userNameElement.textContent = this.currentUser.displayName || this.currentUser.email;
            } else if (this.isDemoMode) {
                userNameElement.textContent = 'Demo Farmer';
            }
        }
        
        this.showSection(this.currentSection);
    }

    createBottomNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        // Remove existing bottom nav if any
        const existingNav = appContainer.querySelector('.bottom-nav');
        if (existingNav) {
            existingNav.remove();
        }

        const navHTML = `
            <div class="bottom-nav" style="${this.objectToStyleString(this.navStyle)}">
                <button class="nav-item" data-view="dashboard" style="${this.objectToStyleString(this.navItemStyle)}">
                    <svg style="width: 24px; height: 24px; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
                              stroke="currentColor" stroke-width="2"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span style="font-size: 12px; font-weight: 500; margin-top: 2px;">Dashboard</span>
                </button>

                <button class="nav-item" data-view="analytics" style="${this.objectToStyleString(this.navItemStyle)}">
                    <svg style="width: 24px; height: 24px; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 20V4" stroke="currentColor" stroke-width="2"/>
                        <path d="M6 20V14" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span style="font-size: 12px; font-weight: 500; margin-top: 2px;">Analytics</span>
                </button>

                <button class="nav-item" data-view="reports" style="${this.objectToStyleString(this.navItemStyle)}">
                    <svg style="width: 24px; height: 24px; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
                              stroke="currentColor" stroke-width="2"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 13H8" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 17H8" stroke="currentColor" stroke-width="2"/>
                        <path d="M10 9H9H8" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span style="font-size: 12px; font-weight: 500; margin-top: 2px;">Reports</span>
                </button>

                <button class="nav-item" data-view="profile" style="${this.objectToStyleString(this.navItemStyle)}">
                    <svg style="width: 24px; height: 24px; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                              stroke="currentColor" stroke-width="2"/>
                        <path d="M19.4 15C19.2669 15.3044 19.201 15.6343 19.2 16C19.2 16.7956 19.5161 17.5587 20.075 18.125C20.6339 18.6913 21.3913 19.0098 22.18 19.0098C22.5182 19.0098 22.8529 18.947 23.1666 18.8245C23.4803 18.702 23.7673 18.5222 24.0116 18.2945C24.2559 18.0668 24.4529 17.7956 24.5918 17.4959C24.7307 17.1962 24.8088 16.8737 24.8216 16.5453C24.8344 16.2169 24.7817 15.8888 24.6666 15.58L23.1666 12.58C23.0335 12.2756 22.9676 11.9457 22.9686 11.58C22.9686 10.7844 22.6525 10.0213 22.0936 9.45501C21.5347 8.88873 20.7773 8.57018 19.9886 8.57018C19.6504 8.57018 19.3157 8.63302 19.002 8.75551C18.6883 8.878 18.4013 9.05778 18.157 9.28548C17.9127 9.51318 17.7157 9.78441 17.5768 10.0841C17.4379 10.3838 17.3598 10.7063 17.347 11.0347C17.3342 11.3631 17.3869 11.6912 17.502 12L19.002 15Z" 
                              stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span style="font-size: 12px; font-weight: 500; margin-top: 2px;">Profile</span>
                </button>
            </div>
        `;

        appContainer.insertAdjacentHTML('beforeend', navHTML);
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update bottom nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.backgroundColor = '';
            item.style.color = '#666';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            activeNavItem.style.color = '#3b82f6';
        }

        // Update sidebar nav active state (if you keep it)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        this.currentSection = sectionId;
        
        // Load the module
        if (window.FarmModules) {
            window.FarmModules.initializeModule(sectionId);
        }
    }

    // Navigation styles
    navStyle = {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: '80px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 0',
        zIndex: 1000
    };

    navItemStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        padding: '12px 16px',
        borderRadius: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        color: '#666',
        minWidth: '60px'
    };

    objectToStyleString(styleObj) {
        return Object.entries(styleObj)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }

    async loadUserData() {
        if (this.isDemoMode || !firebase.firestore || !this.currentUser) return;

        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data loaded:', userData);
                
                if (window.FarmModules) {
                    window.FarmModules.updateAppData({
                        user: userData,
                        farmName: userData.farmName,
                    });
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async logout() {
        try {
            if (firebase.auth) {
                await firebase.auth().signOut();
            }
            if (window.coreModule) {
                window.coreModule.showNotification('Logged out successfully', 'success');
            }
        } catch (error) {
            console.error('Error signing out:', error);
            if (window.coreModule) {
                window.coreModule.showNotification('Error signing out', 'error');
            }
        }
    }
}

// Initialize the app
window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
