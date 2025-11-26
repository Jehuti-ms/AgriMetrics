// app.js - FIXED VERSION
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
            this.initializeModules();
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
            authContainer.classList.add('hidden');
        }
        
        if (appContainer) {
            appContainer.style.display = 'block';
            appContainer.classList.remove('hidden');
        }
        
        // Force show main content areas
        const main = document.querySelector('main');
        const contentArea = document.getElementById('content-area');
        if (main) main.style.display = 'block';
        if (contentArea) contentArea.style.display = 'block';
    }

    showAuthForms() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        console.log('🔄 Showing auth, hiding app...');
        
        if (authContainer) {
            authContainer.style.display = 'block';
            authContainer.classList.remove('hidden');
        }
        
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
    }

    initializeModules() {
        console.log('🔧 Initializing modules...');
        
        // Initialize dashboard if available
        if (typeof DashboardModule !== 'undefined' && DashboardModule.initialize) {
            console.log('📊 Initializing dashboard...');
            DashboardModule.initialize();
        } else {
            console.log('❌ DashboardModule not available');
            this.createFallbackDashboard();
        }
        
        // Initialize navigation
        this.initializeNavigation();
    }

    createFallbackDashboard() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="dashboard-container" style="padding: 20px;">
                    <h1>🚜 AgriMetrics Dashboard</h1>
                    <p>Welcome back! User is signed in.</p>
                    <div style="margin: 20px 0;">
                        <button onclick="FarmModules.showModule('income-expenses')">Income/Expenses</button>
                        <button onclick="FarmModules.showModule('inventory-check')">Inventory</button>
                        <button onclick="FarmModules.showModule('feed-record')">Feed Records</button>
                    </div>
                </div>
            `;
        }
    }

    initializeNavigation() {
        const nav = document.getElementById('main-nav');
        if (nav && window.FarmModules) {
            const modules = window.FarmModules.modules;
            let navHTML = '<div class="nav-container"><ul>';
            
            for (let [moduleId, module] of modules) {
                navHTML += `
                    <li>
                        <a href="#" onclick="FarmModules.showModule('${moduleId}')" class="nav-item">
                            ${module.moduleName}
                        </a>
                    </li>
                `;
            }
            
            navHTML += '</ul></div>';
            nav.innerHTML = navHTML;
            console.log('✅ Navigation initialized');
        }
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

window.farmPWA = new FarmPWA();
