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
            
            this.setupNavigation();
            this.setupEventListeners();
            
            console.log('✅ Farm Management App initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.isDemoMode = true;
            this.setupDemoMode();
            this.setupNavigation();
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

   setupNavigation() {
    const navElement = document.getElementById('main-nav');
    if (!navElement) {
        console.error('❌ Navigation element not found');
        return;
    }

    const navConfig = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'income-expenses', label: 'Income & Expenses', icon: '💰' },
        { id: 'inventory-check', label: 'Inventory', icon: '📦' },
        { id: 'feed-record', label: 'Feed Records', icon: '🌾' },
        { id: 'reports', label: 'Reports', icon: '📈' },
        { id: 'profile', label: 'Profile', icon: '👤' } // Make sure there's no comma after this last item
    ]; // <-- This closing bracket and semicolon are important

    const navList = document.createElement('ul');
    navList.className = 'nav-list';

    navConfig.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'nav-link';
        a.dataset.section = item.id;
        a.innerHTML = `${item.icon} ${item.label}`;
        
        li.appendChild(a);
        navList.appendChild(li);
    });

    // Add user info
    const userLi = document.createElement('li');
    userLi.className = 'nav-item';
    userLi.innerHTML = `
        <div class="user-info">
            <span id="user-name">${this.isDemoMode ? 'Demo Farmer' : 'User'}</span>
            ${this.isDemoMode ? '<span class="demo-badge">Demo</span>' : '<button class="btn btn-secondary logout-btn">Logout</button>'}
        </div>
    `;
    navList.appendChild(userLi);

    navElement.appendChild(navList);

    if (!this.isDemoMode) {
        const logoutBtn = navElement.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    console.log('✅ Navigation setup complete');
}
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
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

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        this.currentSection = sectionId;
        if (window.FarmModules) {
            window.FarmModules.initializeModule(sectionId);
        }
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
