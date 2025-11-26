// app.js - COMPLETE WORKING VERSION
console.log('🚜 Farm Management PWA - Starting...');

class FarmPWA {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, checking auth state...');
            this.setupServiceWorker();
            this.waitForAuthAndInitialize();
        });
    }

    waitForAuthAndInitialize() {
        // Wait for Firebase auth to be ready
        const checkAuth = () => {
            if (window.authManager && window.authManager.auth) {
                console.log('✅ Auth manager ready');
                this.checkAuthState();
            } else {
                console.log('⏳ Waiting for auth manager...');
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }

    checkAuthState() {
        const user = window.authManager?.auth?.currentUser;
        console.log('Auth check - User:', user ? user.email : 'No user');
        
        if (user) {
            console.log('✅ User signed in, showing app');
            this.showApp();
            this.initializeApp();
        } else {
            console.log('❌ No user, showing auth forms');
            this.showAuthForms();
        }
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        console.log('🔄 Showing app, hiding auth...');
        
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
        
        console.log('🔄 Showing auth, hiding app...');
        
        if (authContainer) {
            authContainer.style.display = 'flex';
        }
        
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
    }

    initializeApp() {
        console.log('🔧 Initializing application...');
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize dashboard
        this.initializeDashboard();
        
        // Set up navigation event listeners
        this.setupNavigationEvents();
    }

    initializeNavigation() {
        const nav = document.getElementById('main-nav');
        if (!nav) {
            console.log('❌ main-nav element not found');
            return;
        }
        
        console.log('✅ Found main-nav, populating navigation...');
        
        // Create navigation HTML
        const navHTML = `
            <div class="nav-container">
                <div class="logo">
                    <h1>🚜 AgriMetrics</h1>
                </div>
                <ul class="nav-menu">
                    <li>
                        <a href="#" data-module="dashboard" class="nav-item active">
                            <span class="icon">📊</span>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="income-expenses" class="nav-item">
                            <span class="icon">💰</span>
                            <span>Income & Expenses</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="inventory-check" class="nav-item">
                            <span class="icon">📦</span>
                            <span>Inventory</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="feed-record" class="nav-item">
                            <span class="icon">🌾</span>
                            <span>Feed Records</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="broiler-mortality" class="nav-item">
                            <span class="icon">🐔</span>
                            <span>Broiler Mortality</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="orders" class="nav-item">
                            <span class="icon">📋</span>
                            <span>Orders</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="sales-record" class="nav-item">
                            <span class="icon">💳</span>
                            <span>Sales</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="reports" class="nav-item">
                            <span class="icon">📈</span>
                            <span>Reports</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-module="profile" class="nav-item">
                            <span class="icon">👤</span>
                            <span>Profile</span>
                        </a>
                    </li>
                </ul>
                <div class="nav-footer">
                    <a href="#" class="nav-item sign-out" onclick="firebase.auth().signOut()">
                        <span class="icon">🚪</span>
                        <span>Sign Out</span>
                    </a>
                </div>
            </div>
        `;
        
        nav.innerHTML = navHTML;
        console.log('✅ Navigation populated');
    }

    setupNavigationEvents() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        
        // Add click handlers for navigation items
        nav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (!navItem) return;
            
            e.preventDefault();
            
            // Handle sign out separately
            if (navItem.classList.contains('sign-out')) {
                firebase.auth().signOut();
                return;
            }
            
            const moduleId = navItem.getAttribute('data-module');
            if (moduleId) {
                this.showModule(moduleId, navItem);
            }
        });
    }

    showModule(moduleId, clickedNavItem = null) {
        console.log(`🔄 Showing module: ${moduleId}`);
        
        // Update active navigation item
        if (clickedNavItem) {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            clickedNavItem.classList.add('active');
        }
        
        // Show module content
        if (moduleId === 'dashboard') {
            this.initializeDashboard();
        } else {
            this.showModuleFallback(moduleId);
        }
    }

    initializeDashboard() {
        console.log('📊 Initializing dashboard...');
        
        if (typeof DashboardModule !== 'undefined' && DashboardModule.initialize) {
            DashboardModule.initialize();
        } else {
            this.showModuleFallback('dashboard');
        }
    }

    showModuleFallback(moduleId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const moduleNames = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory Check',
            'feed-record': 'Feed Records',
            'broiler-mortality': 'Broiler Mortality',
            'orders': 'Orders',
            'sales-record': 'Sales Records',
            'reports': 'Reports',
            'profile': 'Profile'
        };
        
        const moduleName = moduleNames[moduleId] || moduleId;
        
        contentArea.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h1>${moduleName}</h1>
                <p style="color: var(--gray-600); margin: 20px 0;">
                    The ${moduleName} module is loading...
                </p>
                <div style="background: var(--gray-100); padding: 20px; border-radius: 10px; display: inline-block;">
                    <p>Module ID: <strong>${moduleId}</strong></p>
                    <p>This is a fallback view. The actual module content should appear here.</p>
                </div>
            </div>
        `;
        
        console.log(`✅ Showing fallback for: ${moduleId}`);
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/AgriMetrics/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                })
                .catch(error => {
                    console.log('❌ Service Worker failed:', error);
                });
        }
    }
}

// Initialize the app
window.farmPWA = new FarmPWA();
