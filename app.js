// app.js - Main application controller
if (typeof window.FarmManagementApp === 'undefined') {
    class FarmManagementApp {
        constructor() {
            this.currentUser = null;
            this.currentSection = 'dashboard';
            this.init();
        }

        async init() {
            try {
                // Wait for DOM to be ready
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
            // Firebase should be initialized in firebase-config.js
            if (typeof firebase === 'undefined') {
                console.warn('Firebase not loaded yet');
                return;
            }
        }

        setupAuthListener() {
            if (!firebase.auth) {
                console.warn('Firebase Auth not available');
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
            });
        }

        setupNavigation() {
            const navElement = document.getElementById('main-nav');
            if (!navElement) return;

            const navConfig = [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'income-expenses', label: 'Income & Expenses', icon: '💰' },
                { id: 'inventory-check', label: 'Inventory', icon: '📦' },
                { id: 'reports', label: 'Reports', icon: '📈' },
                { id: 'animals', label: 'Animals', icon: '🐄' },
                { id: 'crops', label: 'Crops', icon: '🌱' }
            ];

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
            const logoutBtn = navElement.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
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
            
            // Update user name in nav
            const userNameElement = document.getElementById('user-name');
            if (userNameElement && this.currentUser) {
                userNameElement.textContent = this.currentUser.displayName || this.currentUser.email;
            }
            
            this.showSection(this.currentSection);
        }

        showSection(sectionId) {
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
            if (window.FarmModules) {
                window.FarmModules.initializeModule(sectionId);
            } else {
                this.showFallbackContent(sectionId);
            }
        }

        showFallbackContent(sectionId) {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                const sectionName = sectionId.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                contentArea.innerHTML = `
                    <div class="section active">
                        <div class="module-header">
                            <h1>${sectionName}</h1>
                            <p>Module loading...</p>
                        </div>
                        <div class="loading-content">
                            <p>Please wait while the module loads.</p>
                        </div>
                    </div>
                `;
            }
        }

        async loadUserData() {
            try {
                if (!firebase.firestore || !this.currentUser) return;

                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(this.currentUser.uid)
                    .get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log('User data loaded:', userData);
                    
                    // Update app data with user-specific data
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

    // Initialize the app
    window.FarmManagementApp = FarmManagementApp;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.app = new FarmManagementApp();
        });
    } else {
        window.app = new FarmManagementApp();
    }
}
