// app.js - COMPLETE CLEAN VERSION
console.log('🚀 Farm Management App - Loading...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.userPreferences = {};
        this.authChecked = false;
        this.appState = 'loading'; // loading, auth, app
        
        this.init();
    }
    
    init() {
        console.log('🔧 Initializing app...');
        
        // Set initial state
        document.body.classList.add('app-loading');
        
        // Wait for Firebase
        this.waitForFirebase();
    }
    
    waitForFirebase() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            this.setupAuth();
        } else {
            console.log('⏳ Waiting for Firebase...');
            setTimeout(() => this.waitForFirebase(), 100);
        }
    }
    
    setupAuth() {
        console.log('🔐 Setting up authentication...');
        
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged((user) => {
            this.handleAuthStateChange(user);
        });
        
        // Also check immediately
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            this.handleAuthStateChange(currentUser);
        } else {
            // Check localStorage for saved user
            this.checkLocalStorage();
        }
    }
    
    handleAuthStateChange(user) {
    console.log('🔥 Auth state changed:', user ? `User: ${user.email}` : 'No user');
    
    // Always update current user
    this.currentUser = user;
    
    if (user) {
        console.log('👤 User authenticated:', {
            email: user.email,
            uid: user.uid,
            displayName: user.displayName
        });
        
        // Save to localStorage
        this.saveUserToLocalStorage(user);
        
        // Show app interface
        this.showApp();
        
    } else {
        console.log('🔒 No user - showing auth');
        this.showAuth();
    }
    
    this.authChecked = true;
}
    
    checkLocalStorage() {
        console.log('🔍 Checking localStorage for saved user...');
        
        const userEmail = localStorage.getItem('userEmail');
        const userUid = localStorage.getItem('userUid');
        const farmProfile = localStorage.getItem('farm-profile');
        
        if (userEmail && userUid) {
            console.log('💾 Found saved user in localStorage:', userEmail);
            this.currentUser = {
                email: userEmail,
                displayName: localStorage.getItem('userName') || userEmail,
                uid: userUid,
                isLocalUser: true
            };
            this.showApp();
        } else if (farmProfile) {
            console.log('💾 Found farm profile, creating local user');
            try {
                const profile = JSON.parse(farmProfile);
                this.currentUser = {
                    email: profile.email || 'local@farm.com',
                    displayName: profile.ownerName || 'Local User',
                    uid: profile.uid || 'local-' + Date.now(),
                    isLocalUser: true
                };
                this.showApp();
            } catch (e) {
                console.error('Error parsing farm profile:', e);
                this.showAuth();
            }
        } else {
            // No user found anywhere
            this.showAuth();
        }
    }
    
    saveUserToLocalStorage(user) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName || user.email);
        localStorage.setItem('userUid', user.uid);
        
        // Also ensure farm-profile exists
        if (!localStorage.getItem('farm-profile')) {
            localStorage.setItem('farm-profile', JSON.stringify({
                farmName: 'My Farm',
                ownerName: user.displayName || user.email,
                email: user.email,
                uid: user.uid
            }));
        }
    }
    
    clearLocalStorage() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userUid');
        // Keep farm-profile for data persistence
    }
    
    /*showApp() {
        console.log('🏠 Showing app interface...');
        
        // Update body class
        document.body.classList.remove('app-loading');
        document.body.classList.add('app-loaded');
        
        // Initialize app components
        this.initializeAppComponents();
        
        this.appState = 'app';
        console.log('✅ App interface shown');
    } */

    function showApp() {
  console.log('🏠 Showing app interface...');

  const appContainer = document.getElementById('app-container');
  const authForms = document.querySelector('.auth-forms');

  // Unhide the app container
  if (appContainer) {
    appContainer.classList.remove('hidden');
    appContainer.style.display = 'block';
    appContainer.style.visibility = 'visible';
    appContainer.style.opacity = '1';
  }

  // Hide only the login forms
  if (authForms) {
    authForms.style.display = 'none';
  }

  // Render the dashboard
  if (window.FarmModules && window.FarmModules.renderModule) {
    window.FarmModules.renderModule('dashboard');
  }
}
    
    initializeAppComponents() {
        // Initialize StyleManager
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        }
        
        // Initialize FarmModules
        this.initializeFarmModules();
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Create navigation
        this.createTopNavigation();
        
        // Setup UI components
        setTimeout(() => {
            this.setupHamburgerMenu();
            this.setupSideMenuEvents();
            this.setupEventListeners();
            this.setupDarkMode();
            
            // Load initial section
            this.showSection(this.currentSection);
            
            console.log('✅ App components initialized');
        }, 100);
    }
    
    showAuth() {
        console.log('🔐 Showing authentication interface...');
        
        // Update body class
        document.body.classList.remove('app-loading', 'app-loaded');
        
        // Reset any app state
        this.currentUser = null;
        this.authChecked = true;
        this.appState = 'auth';
        
        // Ensure auth forms are properly shown
        this.resetAuthForms();
        
        console.log('✅ Auth interface shown');
    }
    
    resetAuthForms() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Show auth container
        authContainer.style.display = 'block';
        authContainer.style.visibility = 'visible';
        authContainer.style.opacity = '1';
        
        // Show auth forms
        const authForms = authContainer.querySelector('.auth-forms');
        if (authForms) {
            authForms.style.display = 'block';
        }
        
        // Show signin form by default
        const forms = authContainer.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.style.display = 'none';
            form.classList.remove('active');
        });
        
        const signinForm = document.getElementById('signin-form');
        if (signinForm) {
            signinForm.style.display = 'block';
            signinForm.classList.add('active');
        }
        
        // Hide forgot password form
        const forgotForm = document.getElementById('forgot-password-form');
        if (forgotForm) {
            forgotForm.style.display = 'none';
            forgotForm.classList.remove('active');
        }
    }
    
    logout() {
        console.log('🚪 Logging out...');
        
        // Sign out from Firebase
        if (firebase.auth().currentUser) {
            firebase.auth().signOut().catch(error => {
                console.error('Sign out error:', error);
            });
        }
        
        // Clear local user data (keep farm-profile for data)
        this.clearLocalStorage();
        
        // Reset app state
        this.currentUser = null;
        this.authChecked = false;
        this.isDemoMode = false;
        
        // Show auth interface
        this.showAuth();
        
        console.log('✅ Logged out successfully');
    }
    
    // ===== REST OF YOUR EXISTING METHODS (keep as is) =====
    
    initializeFarmModules() {
        if (window.FarmModules) {
            if (typeof FarmModules.initializeAll === 'function') {
                FarmModules.initializeAll();
                console.log('🔧 FarmModules initialized all modules');
            } else {
                console.log('🔧 FarmModules core ready - modules can register');
            }
        } else {
            console.warn('⚠️ FarmModules core not available');
            window.FarmModules = {
                modules: {},
                registerModule: function(name, module) {
                    console.log(`✅ Registering module: ${name}`);
                    this.modules[name] = module;
                },
                getModule: function(name) {
                    return this.modules[name];
                }
            };
        }
    }
    
    loadUserPreferences() {
        try {
            if (window.ProfileModule && typeof window.ProfileModule.loadUserPreferences === 'function') {
                this.userPreferences = window.ProfileModule.loadUserPreferences();
            } else {
                const savedPrefs = localStorage.getItem('farm-user-preferences');
                this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
                this.createProfileModuleFallback();
            }
            this.applyUserTheme();
        } catch (error) {
            console.error('Error loading preferences:', error);
            this.userPreferences = this.getDefaultPreferences();
        }
    }
    
    getDefaultPreferences() {
        return {
            theme: 'auto',
            language: 'en',
            currency: 'USD',
            notifications: true,
            businessName: 'My Farm',
            businessType: 'poultry',
            lowStockThreshold: 10,
            autoSync: true,
            dashboardStats: {}
        };
    }
    
    createProfileModuleFallback() {
        if (typeof ProfileModule === 'undefined') {
            window.ProfileModule = {
                userPreferences: this.userPreferences,
                loadUserPreferences: () => this.userPreferences,
                getUserPreferences: () => this.userPreferences,
                updatePreference: (key, value) => {
                    this.userPreferences[key] = value;
                    localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                },
                initialize: () => true
            };
        }
    }
    
    applyUserTheme() {
        const theme = this.userPreferences.theme || 'auto';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
        }
    }
    
    createTopNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        let header = appContainer.querySelector('header');
        if (header) header.remove();
        
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);

        header.innerHTML = `
            <nav class="top-nav">
                <div class="nav-brand">
                    <img src="icons/icon-96x96_a.png" alt="AgriMetrics">
                    <span class="brand-text">AgriMetrics</span>
                    <span class="brand-subtitle">Farm Management System</span>
                </div>
                
                <div class="nav-items">
                    <button class="nav-item" data-view="dashboard" title="Dashboard">
                        <span>📊</span>
                        <span class="nav-label">Dashboard</span>
                    </button>
                    <button class="nav-item" data-view="income-expenses" title="Income">
                        <span>💰</span>
                        <span class="nav-label">Income</span>
                    </button>
                    <button class="nav-item" data-view="inventory-check" title="Inventory">
                        <span>📦</span>
                        <span class="nav-label">Inventory</span>
                    </button>
                    <button class="nav-item" data-view="orders" title="Orders">
                        <span>📋</span>
                        <span class="nav-label">Orders</span>
                    </button>
                    <button class="nav-item" data-view="sales-record" title="Sales">
                        <span>🛒</span>
                        <span class="nav-label">Sales</span>
                    </button>
                    <button class="nav-item" data-view="profile" title="Profile">
                        <span>👤</span>
                        <span class="nav-label">Profile</span>
                    </button>
                    <button class="nav-item dark-mode-toggle" id="dark-mode-toggle" title="Theme">
                        <span>🌙</span>
                        <span class="nav-label">Theme</span>
                    </button>
                    <button class="nav-item logout-btn" id="logout-btn" title="Logout">
                        <span>🚪</span>
                        <span class="nav-label">Logout</span>
                    </button>
                    <button class="nav-item hamburger-menu" id="hamburger-menu" title="More">
                        <span>☰</span>
                        <span class="nav-label">More</span>
                    </button>
                </div>
            </nav>
        `;

        // Add logout handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        const main = appContainer.querySelector('main');
        if (main) main.style.paddingTop = '80px';
    }
    
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (hamburger && sideMenu) {
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sideMenu.classList.toggle('active');
            });
            
            document.addEventListener('click', (e) => {
                if (sideMenu.classList.contains('active') && 
                    !sideMenu.contains(e.target) && 
                    !hamburger.contains(e.target)) {
                    sideMenu.classList.remove('active');
                }
            });
        }
    }
    
    setupSideMenuEvents() {
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    document.getElementById('side-menu')?.classList.remove('active');
                }
            });
        });
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const view = e.target.closest('.nav-item').getAttribute('data-view');
                if (view) this.showSection(view);
            }
        });
    }
    
    setupDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                const newTheme = isDarkMode ? 'dark' : 'light';
                this.userPreferences.theme = newTheme;
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
            });
        }
    }
    
    showSection(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const cleanSectionId = sectionId.replace('.js', '');
        this.currentSection = cleanSectionId;
        
        contentArea.innerHTML = `<div style="padding: 40px; text-align: center;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                 border-top: 4px solid #4CAF50; border-radius: 50%; 
                 animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p>Loading ${cleanSectionId}...</p>
        </div>`;
        
        setTimeout(() => {
            if (FarmModules && FarmModules.renderModule) {
                FarmModules.renderModule(cleanSectionId, contentArea);
            }
        }, 100);
    }
}

// Initialize app
window.app = new FarmManagementApp();
