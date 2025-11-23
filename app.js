// app.js - Updated to use FarmModules framework
class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        try {
            // Initialize Firebase first
            await this.initializeFirebase();
            
            // Check authentication state
            this.setupAuthListener();
            
            // Setup navigation and event listeners
            this.setupNavigation();
            this.setupEventListeners();
            
            console.log('Farm Management App initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }
    }

    setupAuthListener() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showApp();
                this.loadUserData();
            } else {
                this.currentUser = null;
                this.showAuth();
            }
        });
    }

    setupNavigation() {
        const navConfig = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'income-expenses', label: 'Income & Expenses', icon: '💰' },
            { id: 'inventory-check', label: 'Inventory', icon: '📦' },
            { id: 'reports', label: 'Reports', icon: '📈' },
            { id: 'animals', label: 'Animals', icon: '🐄' },
            { id: 'crops', label: 'Crops', icon: '🌱' }
        ];

        const navElement = document.getElementById('main-nav');
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

        // Add user info and logout
        const userLi = document.createElement('li');
        userLi.className = 'nav-item';
        userLi.innerHTML = `
            <div class="user-info">
                <span id="user-name">User</span>
                <button class="btn btn-secondary logout-btn">Logout</button>
            </div>
        `;
        navList.appendChild(userLi);

        navElement.appendChild(navList);

        // Add logout handler
        navElement.querySelector('.logout-btn').addEventListener('click', () => this.logout());
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            }
        });
    }

    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }

    showApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Update user name in nav
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.displayName || this.currentUser.email;
        }
        
        this.showSection(this.currentSection);
    }

    async showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Update content using FarmModules framework
        this.currentSection = sectionId;
        FarmModules.initializeModule(sectionId);
    }

    async loadUserData() {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data loaded:', userData);
                
                // Update app data with user-specific data
                FarmModules.updateAppData({
                    user: userData,
                    farmName: userData.farmName,
                    // Load other user data as needed
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async logout() {
        try {
            await firebase.auth().signOut();
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('Logged out successfully', 'success');
            }
        } catch (error) {
            console.error('Error signing out:', error);
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('Error signing out', 'error');
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FarmManagementApp();
});
