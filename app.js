// app.js - PWA OPTIMIZED VERSION
console.log('🚜 Farm Management PWA - Starting...');

class FarmPWA {
    constructor() {
        this.currentModule = 'dashboard';
        this.init();
    }

    init() {
        // PWA: Use DOMContentLoaded for faster startup
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('📱 PWA Initializing...');
        
        this.setupServiceWorker();
        this.setupPWAFeatures();
        this.waitForAuthAndInitialize();
    }

    setupPWAFeatures() {
        // PWA: Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // PWA: Handle back button (Android)
        window.addEventListener('beforeunload', (e) => {
            // Save state before app closes
            this.saveAppState();
        });
        
        // PWA: Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveAppState();
            }
        });
    }

    saveAppState() {
        // PWA: Save current state to localStorage
        const state = {
            currentModule: this.currentModule,
            timestamp: Date.now()
        };
        localStorage.setItem('farmPWAState', JSON.stringify(state));
    }

    loadAppState() {
        // PWA: Load saved state
        try {
            const saved = localStorage.getItem('farmPWAState');
            if (saved) {
                const state = JSON.parse(saved);
                // Only restore if less than 1 hour old
                if (Date.now() - state.timestamp < 3600000) {
                    return state.currentModule;
                }
            }
        } catch (e) {
            console.log('❌ Failed to load app state:', e);
        }
        return 'dashboard';
    }

    waitForAuthAndInitialize() {
        // PWA: Progressive enhancement - show app immediately
        this.showSplashScreen();
        
        const checkAuth = () => {
            if (window.authManager && window.authManager.auth) {
                console.log('✅ Auth manager ready');
                this.hideSplashScreen();
                this.checkAuthState();
            } else {
                console.log('⏳ Waiting for auth manager...');
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }

    showSplashScreen() {
        // PWA: Show immediate feedback
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh; flex-direction: column; gap: var(--spacing-4);">
                    <div style="font-size: 48px;">🚜</div>
                    <div style="font: var(--body-large); color: var(--on-surface-variant);">Loading AgriMetrics...</div>
                </div>
            `;
        }
    }

    hideSplashScreen() {
        // Content will be replaced by actual modules
    }

    checkAuthState() {
        const user = window.authManager?.auth?.currentUser;
        console.log('🔐 Auth check - User:', user ? user.email : 'No user');
        
        if (user) {
            console.log('✅ User signed in, showing app');
            this.showApp();
            this.initializeAppModules();
        } else {
            console.log('❌ No user, showing auth forms');
            this.showAuthForms();
        }
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        // PWA: Smooth transitions
        if (authContainer) {
            authContainer.style.display = 'none';
        }
        
        if (appContainer) {
            appContainer.style.display = 'flex';
            appContainer.classList.remove('hidden');
        }
    }

    showAuthForms() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) {
            authContainer.style.display = 'flex';
        }
        
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
    }

    initializeAppModules() {
        console.log('🔧 Initializing PWA modules...');
        
        // PWA: Load saved state
        this.currentModule = this.loadAppState();
        
        this.initializeNavigation();
        this.initializeCurrentModule();
        this.setupNavigationEvents();
        
        // PWA: Preload other modules
        this.preloadModules();
    }

    initializeNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav) {
        console.log('❌ main-nav element not found');
        return;
    }
    
    console.log('✅ Setting up PWA top navigation...');
    
    const navHTML = `
        <div class="nav-container">
            <div class="logo">
                <div style="font-size: 24px;">🚜</div>
                <h1>AgriMetrics</h1>
            </div>
            <ul class="nav-menu">
                <li>
                    <button data-module="dashboard" class="nav-item ${this.currentModule === 'dashboard' ? 'active' : ''}">
                        <span class="icon">📊</span>
                        <span class="label">Dashboard</span>
                    </button>
                </li>
                <li>
                    <button data-module="income-expenses" class="nav-item ${this.currentModule === 'income-expenses' ? 'active' : ''}">
                        <span class="icon">💰</span>
                        <span class="label">Finance</span>
                    </button>
                </li>
                <li>
                    <button data-module="inventory-check" class="nav-item ${this.currentModule === 'inventory-check' ? 'active' : ''}">
                        <span class="icon">📦</span>
                        <span class="label">Inventory</span>
                    </button>
                </li>
                <li>
                    <button data-module="feed-record" class="nav-item ${this.currentModule === 'feed-record' ? 'active' : ''}">
                        <span class="icon">🌾</span>
                        <span class="label">Feed</span>
                    </button>
                </li>
                <li>
                    <button data-module="broiler-mortality" class="nav-item ${this.currentModule === 'broiler-mortality' ? 'active' : ''}">
                        <span class="icon">🐔</span>
                        <span class="label">Poultry</span>
                    </button>
                </li>
                <li>
                    <button data-module="sales-record" class="nav-item ${this.currentModule === 'sales-record' ? 'active' : ''}">
                        <span class="icon">💳</span>
                        <span class="label">Sales</span>
                    </button>
                </li>
                <li>
                    <button data-module="reports" class="nav-item ${this.currentModule === 'reports' ? 'active' : ''}">
                        <span class="icon">📈</span>
                        <span class="label">Reports</span>
                    </button>
                </li>
                <li>
                    <button data-module="profile" class="nav-item ${this.currentModule === 'profile' ? 'active' : ''}">
                        <span class="icon">👤</span>
                        <span class="label">Profile</span>
                    </button>
                </li>
            </ul>
            <div class="nav-footer">
                <button class="nav-item sign-out" onclick="farmPWA.signOut()">
                    <span class="icon">🚪</span>
                    <span class="label">Sign Out</span>
                </button>
            </div>
        </div>
    `;
    
    nav.innerHTML = navHTML;
    console.log('✅ PWA Top Navigation ready');
}

    setupNavigationEvents() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        
        // PWA: Use event delegation for better performance
        nav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (!navItem) return;
            
            e.preventDefault();
            
            if (navItem.classList.contains('sign-out')) {
                this.signOut();
                return;
            }
            
            const moduleId = navItem.getAttribute('data-module');
            if (moduleId) {
                this.showModule(moduleId, navItem);
            }
        });
        
        // PWA: Add keyboard support
        nav.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const navItem = e.target.closest('.nav-item');
                if (navItem) {
                    e.preventDefault();
                    navItem.click();
                }
            }
        });
    }

    showModule(moduleId, clickedNavItem = null) {
        console.log(`🔄 Showing module: ${moduleId}`);
        
        // PWA: Update current module
        this.currentModule = moduleId;
        this.saveAppState();
        
        // Update active navigation item
        if (clickedNavItem) {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.classList.remove('active');
                item.setAttribute('aria-current', 'false');
            });
            clickedNavItem.classList.add('active');
            clickedNavItem.setAttribute('aria-current', 'page');
        }
        
        // Show module content with PWA loading pattern
        this.showModuleContent(moduleId);
    }

    showModuleContent(moduleId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // PWA: Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 40vh; flex-direction: column; gap: var(--spacing-4);">
                <div style="font-size: 32px;">${this.getModuleIcon(moduleId)}</div>
                <div style="font: var(--body-large); color: var(--on-surface-variant);">Loading ${this.getModuleName(moduleId)}...</div>
            </div>
        `;
        
        // PWA: Load module with slight delay for perceived performance
        setTimeout(() => {
            this.loadModule(moduleId);
        }, 50);
    }

    loadModule(moduleId) {
        switch(moduleId) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            default:
                this.showModuleFallback(moduleId);
        }
    }

    initializeCurrentModule() {
        this.loadModule(this.currentModule);
    }

    initializeDashboard() {
        console.log('📊 Initializing dashboard...');
        
        if (typeof DashboardModule !== 'undefined' && DashboardModule.initialize) {
            DashboardModule.initialize();
        } else {
            this.showModuleFallback('dashboard');
        }
    }

    getModuleIcon(moduleId) {
        const icons = {
            'dashboard': '📊',
            'income-expenses': '💰',
            'inventory-check': '📦',
            'feed-record': '🌾',
            'sales-record': '💳',
            'reports': '📈'
        };
        return icons[moduleId] || '📁';
    }

    getModuleName(moduleId) {
        const names = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory',
            'feed-record': 'Feed Records',
            'sales-record': 'Sales',
            'reports': 'Reports'
        };
        return names[moduleId] || moduleId;
    }

    showModuleFallback(moduleId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const moduleName = this.getModuleName(moduleId);
        
        contentArea.innerHTML = `
            <div class="dashboard-container">
                <div class="welcome-section">
                    <h1>${moduleName}</h1>
                    <p>Manage your ${moduleName.toLowerCase()} efficiently</p>
                </div>
                
                <div style="text-align: center; padding: var(--spacing-10);">
                    <div style="font-size: 64px; margin-bottom: var(--spacing-4); opacity: 0.5;">
                        ${this.getModuleIcon(moduleId)}
                    </div>
                    <h2 style="font: var(--title-large); margin-bottom: var(--spacing-2);">Module Coming Soon</h2>
                    <p style="font: var(--body-large); color: var(--on-surface-variant); margin-bottom: var(--spacing-6);">
                        The ${moduleName} module is under development.
                    </p>
                    <button onclick="farmPWA.showModule('dashboard')" class="btn btn-primary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        `;
        
        console.log(`✅ Showing PWA fallback for: ${moduleId}`);
    }

    preloadModules() {
        // PWA: Preload other modules in background
        console.log('🔮 Preloading modules...');
        // Could use Service Worker for actual preloading
    }

    async signOut() {
        try {
            // PWA: Clear app state
            localStorage.removeItem('farmPWAState');
            
            await firebase.auth().signOut();
            console.log('✅ Signed out successfully');
            
            // PWA: Smooth transition back to auth
            this.showAuthForms();
        } catch (error) {
            console.log('❌ Sign out error:', error);
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/AgriMetrics/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                    
                    // PWA: Check for updates
                    registration.addEventListener('updatefound', () => {
                        console.log('🔄 Service Worker update found');
                    });
                })
                .catch(error => {
                    console.log('❌ Service Worker failed:', error);
                });
        }
    }
}

// PWA: Initialize app immediately
window.farmPWA = new FarmPWA();

// PWA: Make globally available for standalone use
window.showModule = (moduleId) => window.farmPWA.showModule(moduleId);
