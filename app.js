// app.js - Simplified working version
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.init();
    }

    async init() {
        console.log('🚀 Starting Farm Management App...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        console.log('✅ Initializing app...');
        
        // Skip Firebase for now - just show the app
        this.isDemoMode = true;
        this.showApp();
        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target);
            
            // Check if click is on nav item
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const view = navItem.getAttribute('data-view');
                console.log('Nav item clicked:', view);
                
                if (view === 'more') {
                    this.toggleMoreMenu();
                } else {
                    this.showSection(view);
                }
                return;
            }
            
            // Check if click is on more menu item
            const menuItem = e.target.closest('.more-menu-item');
            if (menuItem) {
                const view = menuItem.getAttribute('data-view');
                console.log('Menu item clicked:', view);
                this.hideMoreMenu();
                this.showSection(view);
                return;
            }
            
            // Close more menu when clicking outside
            if (!e.target.closest('.more-menu') && !e.target.closest('[data-view="more"]')) {
                this.hideMoreMenu();
            }
        });
    }

    showApp() {
        console.log('Showing app...');
        
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        this.createTopNavigation();
        this.showSection(this.currentSection);
    }

    createTopNavigation() {
        console.log('Creating top navigation...');
        
        const appContainer = document.getElementById('app-container');
        if (!appContainer) {
            console.error('App container not found!');
            return;
        }

        // Clear existing header
        let header = appContainer.querySelector('header');
        if (header) {
            header.remove();
        }
        
        // Create new header
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);

        // Create simple, visible navigation
        header.innerHTML = `
            <nav class="top-nav" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: #ffffff;
                border-bottom: 2px solid #333;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 1000;
            ">
                <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px; color: black;">🌱</span>
                    <span style="font-weight: bold; font-size: 18px; color: black;">Farm Management</span>
                </div>
                
                <div class="nav-items" style="display: flex; align-items: center; gap: 10px;">
                    <button class="nav-item" data-view="dashboard" style="
                        display: flex;
                        align-items: center;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        color: black;
                        gap: 6px;
                        font-size: 14px;
                    ">
                        <span style="font-size: 16px;">📊</span>
                        <span>Home</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" style="
                        display: flex;
                        align-items: center;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        color: black;
                        gap: 6px;
                        font-size: 14px;
                    ">
                        <span style="font-size: 16px;">💰</span>
                        <span>Finance</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" style="
                        display: flex;
                        align-items: center;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        color: black;
                        gap: 6px;
                        font-size: 14px;
                    ">
                        <span style="font-size: 16px;">📦</span>
                        <span>Inventory</span>
                    </button>

                    <button class="nav-item" data-view="more" style="
                        display: flex;
                        align-items: center;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        color: black;
                        gap: 6px;
                        font-size: 14px;
                    ">
                        <span style="font-size: 16px;">⋮</span>
                        <span>More</span>
                    </button>
                </div>
            </nav>

            <div id="more-menu" class="more-menu hidden" style="
                position: fixed;
                top: 65px;
                right: 20px;
                background: white;
                border: 2px solid #333;
                border-radius: 4px;
                padding: 10px;
                z-index: 1001;
                min-width: 150px;
            ">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button class="more-menu-item" data-view="feed-record" style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; color: black;">
                        <span>🌾</span>
                        <span>Feed</span>
                    </button>
                    <button class="more-menu-item" data-view="profile" style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; color: black;">
                        <span>👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        `;

        // Add padding to main content
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '70px';
        }
        
        console.log('✅ Navigation created - should be visible now');
        console.log('Header element:', header);
        console.log('Nav items found:', document.querySelectorAll('.nav-item').length);
    }

    showSection(sectionId) {
        console.log('Switching to section: ' + sectionId);
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.background = '#f0f0f0';
            item.style.color = 'black';
        });
        
        const activeNavItem = document.querySelector('.nav-item[data-view="' + sectionId + '"]');
        if (activeNavItem) {
            activeNavItem.style.background = '#007bff';
            activeNavItem.style.color = 'white';
        }

        this.currentSection = sectionId;
        
        // Show content
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = '<div style="padding: 20px;"><h2>' + sectionId + '</h2><p>Content for ' + sectionId + '</p></div>';
        }
    }

    toggleMoreMenu() {
        console.log('Toggle more menu');
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu) {
            if (moreMenu.classList.contains('hidden')) {
                moreMenu.classList.remove('hidden');
                console.log('More menu opened');
            } else {
                moreMenu.classList.add('hidden');
                console.log('More menu closed');
            }
        } else {
            console.error('More menu not found!');
        }
    }

    hideMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu) {
            moreMenu.classList.add('hidden');
        }
    }
}

// Initialize app
window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded - initializing app');
        window.app = new FarmManagementApp();
    });
} else {
    console.log('DOM already loaded - initializing app');
    window.app = new FarmManagementApp();
}
