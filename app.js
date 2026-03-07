// app.js - Updated with better auth handling
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.userPreferences = {};
        this.authInitialized = false;
        this.setupInit();
        this.initializeMenu();
    }

    setupInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    async initializeApp() {
    console.log('✅ Initializing app...');
    
    // Show loading screen
    this.showLoading();
    
    // Setup Firebase auth listener FIRST
    await this.setupAuthListener();
    
    // Check if user is already authenticated
    this.checkInitialAuth();

    // Ensure menu starts hidden
    setTimeout(() => {
        this.initializeMenuPosition();
    }, 100);

    // Fix content position
    setTimeout(() => {
        this.fixContentPosition();
    }, 150);

    // Setup responsive form fixes on resize
    window.addEventListener('resize', () => {
        setTimeout(() => this.fixOverflowingForms(), 100);
    });
}

// This should be a separate method, NOT inside initializeApp()
fixContentPosition() {
    console.log('📐 Fixing content position...');
    
    const contentArea = document.getElementById('content-area');
    const navbar = document.querySelector('.navbar');
    
    if (contentArea && navbar) {
        const navbarHeight = navbar.offsetHeight;
        const isLargeScreen = window.innerWidth >= 1024;
        
        // Different positioning for large vs small screens
        if (isLargeScreen) {
            // For large screens - more aggressive positioning
            contentArea.style.cssText = `
                margin-top: -10px !important;  /* Negative margin to pull up */
                padding-top: 0 !important;
                position: relative;
                top: -10px !important;
                min-height: calc(100vh - ${navbarHeight - 10}px);
            `;
            
            // Target specific problematic modules more aggressively
            const problemModules = ['income', 'profile', 'broiler', 'production'];
            problemModules.forEach(module => {
                const elements = contentArea.querySelectorAll(`[class*="${module}"] .module-header`);
                elements.forEach(el => {
                    el.style.marginTop = '-15px !important';
                    el.style.paddingTop = '0 !important';
                    el.style.position = 'relative';
                    el.style.top = '-5px !important';
                });
            });
        } else {
            // For small screens - normal positioning
            contentArea.style.cssText = `
                margin-top: 0 !important;
                padding-top: 0 !important;
                position: relative;
                top: 0;
                min-height: calc(100vh - ${navbarHeight}px);
            `;
        }
        
        // Also fix any module headers globally
        const moduleHeaders = contentArea.querySelectorAll('.module-header');
        moduleHeaders.forEach(header => {
            header.style.marginTop = '0';
            header.style.paddingTop = isLargeScreen ? '0' : '10px';
        });
    }
    
    console.log('✅ Content position fixed for', window.innerWidth >= 1024 ? 'large screen' : 'small screen');
    
    // Re-check after a short delay to ensure it sticks
    setTimeout(() => {
        this.fixModuleHeaderSpecifics();
    }, 100);
}

// NEW METHOD: Fix specific problematic modules
fixModuleHeaderSpecifics() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    // List of problematic module classes/ids
    const problemSelectors = [
        '.income-module',
        '.profile-module', 
        '.broiler-module',
        '.production-module',
        '[class*="income"]',
        '[class*="profile"]',
        '[class*="broiler"]',
        '[class*="production"]'
    ];
    
    problemSelectors.forEach(selector => {
        const elements = contentArea.querySelectorAll(selector);
        elements.forEach(element => {
            // Find headers within these modules
            const headers = element.querySelectorAll('.module-header, h1, h2.module-title');
            headers.forEach(header => {
                // Force position to top
                header.style.cssText = `
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                    position: relative !important;
                    top: 0 !important;
                    z-index: 100;
                `;
                
                // Ensure parent doesn't have padding
                const parent = header.parentElement;
                if (parent) {
                    parent.style.paddingTop = '0 !important';
                    parent.style.marginTop = '0 !important';
                }
            });
            
            // Also fix the module container itself
            element.style.marginTop = '0 !important';
            element.style.paddingTop = '0 !important';
        });
    });
}    
 
    // Add this method to your App class
fixOverflowingForms() {
    console.log('🔧 Checking for overflowing forms...');
    
    // Check all forms and form containers
    const forms = document.querySelectorAll('form, .form-container, .glass-card, .popout-modal-content');
    
    forms.forEach(form => {
        const rect = form.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // If form is wider than viewport
        if (rect.width > viewportWidth) {
            console.log('Form overflowing:', form.className);
            
            // Apply fixes
            form.style.width = '100%';
            form.style.maxWidth = '100%';
            form.style.overflowX = 'hidden';
            form.style.boxSizing = 'border-box';
            
            // Also fix all child inputs
            const inputs = form.querySelectorAll('input, select, textarea, .form-group');
            inputs.forEach(input => {
                input.style.width = '100%';
                input.style.maxWidth = '100%';
                input.style.boxSizing = 'border-box';
            });
        }
    });
}
    
initializeMenuPosition() {
  try {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.querySelector('.side-menu-overlay');

    console.log('📐 Initializing menu position...');
    console.log('Menu element found:', !!sideMenu);
    console.log('Overlay element found:', !!overlay);

    if (sideMenu) {
      // Start with menu hidden by class
      sideMenu.classList.remove('open');
      sideMenu.classList.add('closed');
      sideMenu.style.transform = ''; // clear inline transform
    }
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.display = '';
    }
  } catch (error) {
    console.error('❌ Error initializing menu position:', error);
  }
}

    
    async setupAuthListener() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.log('⏳ Waiting for Firebase...');
            setTimeout(() => this.setupAuthListener(), 100);
            return;
        }
        
        // Setup auth state listener
        firebase.auth().onAuthStateChanged((user) => {
            console.log('🔥 Auth state changed:', user ? `User: ${user.email}` : 'No user');
            
            if (user) {
                this.handleUserAuthenticated(user);
            } else {
                this.handleNoUser();
            }
            
        });
    }
    
checkInitialAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
            console.log('👤 User already signed in:', user.email);
            this.handleUserAuthenticated(user);
        } else {
            console.log('🔒 No user found initially - showing auth form');
            // Show auth form IMMEDIATELY, don't wait
            this.handleNoUser();
        }
    }
}

    handleUserAuthenticated(user) {
        console.log('🎉 User authenticated, showing app...');
        this.currentUser = user;
        this.authInitialized = true;
        
        // Store user info
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userAuthenticated', 'true');
        
        // Show app
        this.showApp();
        
        // Initialize app components
        this.initializeAppComponents();
    }
    
        async initializeAppComponents() {
    console.log('🚀 Initializing app components...');
    
    // ===== CREATE CENTRAL DATA STORE =====
    window.FarmData = {
        sales: [],
        production: [],
        inventory: [],
        expenses: [],
        transactions: [],
        lastUpdated: null
    };
    
    // Initialize modules
    this.initializeStyleManager();
    this.initializeFarmModules();
    
    // Load user preferences
    await this.loadUserPreferences();
    this.applyUserTheme();
    this.setupSystemThemeListener();
    
    // Setup UI - CREATE NAVIGATION FIRST
    this.createTopNavigation();
    
    // Setup logout handlers AFTER creating navigation
    this.setupLogoutHandlers();
    
    // ===== LOAD ALL DATA FROM FIREBASE =====
    try {
        console.log('🔥 Loading all farm data into FarmData...');
        
        // Show loading notification
        if (typeof showAgrimetricsNotification === 'function') {
            showAgrimetricsNotification('Loading your farm data...', 'info');
        }
        
        // Get current user
        const user = firebase.auth().currentUser;
        if (user) {
            console.log('👤 Loading data for user:', user.uid);
            
            // Load all data in parallel for better performance
            await Promise.all([
                this.loadSalesData(user),
                this.loadProductionData(user),
                this.loadInventoryData(user),
                this.loadExpensesData(user)
            ]);
            
            // ===== COMBINE INTO TRANSACTIONS =====
            // Add sales as income transactions
            window.FarmData.sales.forEach(sale => {
                window.FarmData.transactions.push({
                    id: sale.id,
                    date: sale.date,
                    type: 'income',
                    category: 'sales',
                    amount: sale.totalAmount || 0,
                    description: `Sale: ${sale.product || 'Product'}`,
                    customer: sale.customer,
                    originalData: sale
                });
            });
            
            // Add expenses as expense transactions
            window.FarmData.expenses.forEach(expense => {
                window.FarmData.transactions.push({
                    id: expense.id,
                    date: expense.date,
                    type: 'expense',
                    category: expense.category || 'other',
                    amount: expense.amount || 0,
                    description: expense.description || 'Expense',
                    originalData: expense
                });
            });
            
            // Sort transactions by date
            window.FarmData.transactions.sort((a, b) => 
                new Date(b.date || 0) - new Date(a.date || 0)
            );
            
            window.FarmData.lastUpdated = new Date().toISOString();
            
            // ===== MAKE DATA AVAILABLE GLOBALLY =====
            // For backward compatibility
            window.salesData = window.FarmData.sales;
            window.currentSalesData = window.FarmData.sales;
            window.productionData = window.FarmData.production;
            window.inventoryData = window.FarmData.inventory;
            window.expensesData = window.FarmData.expenses;
            
            // Store in FarmModules for compatibility
            if (!window.FarmModules) window.FarmModules = {};
            if (!window.FarmModules.appData) window.FarmModules.appData = {};
            window.FarmModules.appData = window.FarmData;
            
            // Save to localStorage as backup
            localStorage.setItem('farmData', JSON.stringify({
                sales: window.FarmData.sales,
                production: window.FarmData.production,
                inventory: window.FarmData.inventory,
                expenses: window.FarmData.expenses,
                transactions: window.FarmData.transactions,
                lastUpdated: window.FarmData.lastUpdated
            }));
            
            // Update last sync time
            localStorage.setItem('agrimetricsLastSync', new Date().toISOString());
            
            // Dispatch event that data is loaded
            window.dispatchEvent(new CustomEvent('farm-data-loaded', { 
                detail: window.FarmData 
            }));
            
            console.log('✅ All Firebase data loaded into FarmData:', {
                sales: window.FarmData.sales.length,
                production: window.FarmData.production.length,
                inventory: window.FarmData.inventory.length,
                expenses: window.FarmData.expenses.length,
                transactions: window.FarmData.transactions.length
            });
            
            // Show success
            if (typeof showAgrimetricsNotification === 'function') {
                showAgrimetricsNotification(`Loaded ${window.FarmData.transactions.length} transactions!`, 'success');
            }
            if (typeof updateAgrimetricsSyncStatus === 'function') {
                updateAgrimetricsSyncStatus('✅ Synced', '#4CAF50');
            }
            
        } else {
            console.log('⚠️ No user logged in, skipping data load');
        }
        
    } catch (error) {
        console.error('❌ Error loading farm data:', error);
        if (typeof showAgrimetricsNotification === 'function') {
            showAgrimetricsNotification('Error loading data', 'error');
        }
    }
    
    // Continue with UI setup
    setTimeout(() => {
        this.setupHamburgerMenu();
        this.setupEventListeners(); 
        this.setupDarkMode();
        this.showSection(this.currentSection);
        this.hideLoading();
        console.log('✅ App fully initialized with FarmData');
    }, 100);
}

// ===== ADD THESE HELPER METHODS =====

async loadSalesData(user) {
    try {
        const salesSnapshot = await db.collection('sales').doc(user.uid).collection('records').get();
        console.log(`📊 Found ${salesSnapshot.size} sales periods`);
        
        let allSales = [];
        salesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.entries && data.entries.length > 0) {
                allSales = allSales.concat(data.entries);
            } else if (data.sales && data.sales.length > 0) {
                allSales = allSales.concat(data.sales);
            } else if (Array.isArray(data) && data.length > 0) {
                allSales = allSales.concat(data);
            }
        });
        
        window.FarmData.sales = allSales;
        console.log(`✅ Loaded ${allSales.length} sales records`);
    } catch (e) {
        console.log('Error loading sales:', e);
        window.FarmData.sales = [];
    }
}

async loadProductionData(user) {
    try {
        const productionSnapshot = await db.collection('production').doc(user.uid).collection('records').get();
        console.log(`📊 Found ${productionSnapshot.size} production periods`);
        
        let allProduction = [];
        productionSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.entries && data.entries.length > 0) {
                allProduction = allProduction.concat(data.entries);
            } else if (Array.isArray(data) && data.length > 0) {
                allProduction = allProduction.concat(data);
            }
        });
        
        window.FarmData.production = allProduction;
        console.log(`✅ Loaded ${allProduction.length} production records`);
    } catch (e) {
        console.log('Error loading production:', e);
        window.FarmData.production = [];
    }
}

async loadInventoryData(user) {
    try {
        const inventoryDoc = await db.collection('inventory').doc(user.uid).get();
        if (inventoryDoc.exists) {
            const data = inventoryDoc.data();
            window.FarmData.inventory = data.items || data.inventory || [];
            console.log(`✅ Loaded ${window.FarmData.inventory.length} inventory items`);
        } else {
            console.log('ℹ️ No inventory data found');
            window.FarmData.inventory = [];
        }
    } catch (e) {
        console.log('Error loading inventory:', e);
        window.FarmData.inventory = [];
    }
}

async loadExpensesData(user) {
    try {
        const expensesSnapshot = await db.collection('expenses').doc(user.uid).collection('records').get();
        console.log(`📊 Found ${expensesSnapshot.size} expense periods`);
        
        let allExpenses = [];
        expensesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.entries && data.entries.length > 0) {
                allExpenses = allExpenses.concat(data.entries);
            } else if (Array.isArray(data) && data.length > 0) {
                allExpenses = allExpenses.concat(data);
            }
        });
        
        window.FarmData.expenses = allExpenses;
        console.log(`✅ Loaded ${allExpenses.length} expense records`);
    } catch (e) {
        console.log('Error loading expenses:', e);
        window.FarmData.expenses = [];
    }
}
    
  handleNoUser() {
    console.log('🔒 No user found, showing auth');
    this.authInitialized = true;
    
    const splash = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const signin = document.getElementById('signin-form');
    const appContainer = document.getElementById('app-container');
    
    // Hide splash
    if (splash) {
        splash.style.display = 'none';
    }
    
    // Show auth container
    if (authContainer) {
        authContainer.style.display = 'block';
        authContainer.classList.add('active');
        
        // Reset to signin form
        if (signin) {
            signin.classList.add('active');
        }
    }
    
    // Hide app container
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // CRITICAL: Update body classes
    document.body.classList.add('auth-visible');
    document.body.classList.remove('app-active', 'loading');
    
    // Hide loading
    this.hideLoading();
    
    console.log('✅ Auth screen shown');
}
    
    showLoading() {
        if (!document.getElementById('app-loading')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'app-loading';
            loadingDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #4CAF50;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    "></div>
                    <div style="color: #666; font-size: 16px;">Loading AgriMetrics...</div>
                </div>
            `;
            document.body.appendChild(loadingDiv);
        } else {
            document.getElementById('app-loading').style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingDiv = document.getElementById('app-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
    
    initializeStyleManager() {
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        }
    }

    initializeFarmModules() {
        if (window.FarmModules) {
            console.log('🔧 FarmModules core ready');
        } else {
            window.FarmModules = {
                modules: {},
                registerModule: function(name, module) {
                    this.modules[name] = module;
                }
            };
        }
    }
    
    async loadUserPreferences() {
        try {
            const savedPrefs = localStorage.getItem('farm-user-preferences');
            this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
            this.applyUserTheme();
        } catch (error) {
            this.userPreferences = this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            theme: 'auto',
            businessName: 'My Farm',
            businessType: 'poultry'
        };
    }

applyUserTheme() {
  const theme = this.userPreferences.theme || 'auto';

  // Clear both classes first
  document.body.classList.remove('dark-mode', 'light-mode');

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    // Auto mode: follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // ✅ Force light mode on first run if no saved preference
    const hasSavedPrefs = localStorage.getItem('farm-user-preferences');
    if (!hasSavedPrefs) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.add(prefersDark ? 'dark-mode' : 'light-mode');
    }
  }

  this.updateThemeToggleIcon();
}

     setupDarkMode() {
  // Wait for navigation to be created
  setTimeout(() => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) {
      console.error('❌ Dark mode toggle button not found');
      return;
    }

    // Remove existing listeners safely
    const newToggle = darkModeToggle.cloneNode(true);
    darkModeToggle.parentNode.replaceChild(newToggle, darkModeToggle);

    // Attach click handler
    newToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDarkMode();
    });

    // Apply current theme and update icon
    this.applyUserTheme();   // ensures body class matches saved preference
    this.updateThemeToggleIcon();

    console.log('✅ Theme toggle button initialized');
  }, 200); // Give time for navigation to render
}
    
toggleDarkMode() {
  // Flip between dark and light explicitly
  if (document.body.classList.contains('dark-mode')) {
    this.userPreferences.theme = 'light';
  } else {
    this.userPreferences.theme = 'dark';
  }

  this.applyUserTheme();
}

updateThemeToggleIcon() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const iconSpan = darkModeToggle.querySelector('span');
    
    if (iconSpan) {
        iconSpan.textContent = isDarkMode ? '☀️' : '🌙';
        darkModeToggle.title = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
    }
}

    setupSystemThemeListener() {
  // Listen for OS theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', e => {
    if (this.userPreferences.theme === 'auto') {
      document.body.classList.toggle('dark-mode', e.matches);
      this.updateThemeToggleIcon();
      console.log('🔄 System theme changed, auto mode updated');
    }
  });
}

setupEventListeners() {
  document.addEventListener('click', (e) => {
    // Handle nav items
    if (e.target.closest('.nav-item')) {
      const navItem = e.target.closest('.nav-item');
      const view = navItem.getAttribute('data-view');
      if (view) {
        e.preventDefault();
        this.showSection(view);
      }
    }
      
    // Handle side menu items
    if (e.target.closest('.side-menu-item')) {
      const menuItem = e.target.closest('.side-menu-item');
      const section = menuItem.getAttribute('data-section');
      if (section) {
        e.preventDefault();
        e.stopPropagation();

        const sideMenu = document.getElementById('side-menu');
        const overlay = document.querySelector('.side-menu-overlay');

        if (sideMenu) {
          sideMenu.classList.remove('open');
          sideMenu.classList.add('closed');
        }
        if (overlay) {
          overlay.classList.remove('active');
        }

        setTimeout(() => {
          this.showSection(section);
        }, 300);

        console.log(`📱 Navigated to ${section}, menu closed`);
      }
    }
  });
}

// Add this method to your App class
openSideMenu() {
  const sideMenu = document.getElementById('side-menu');
  const overlay = document.querySelector('.side-menu-overlay');
  
  if (sideMenu) {
    sideMenu.classList.remove('closed');
    sideMenu.classList.add('open');
  }
  if (overlay) {
    overlay.classList.add('active');
  }
}

closeSideMenu() {
  const sideMenu = document.getElementById('side-menu');
  const overlay = document.querySelector('.side-menu-overlay');
  
  if (sideMenu) {
    sideMenu.classList.remove('open');
    sideMenu.classList.add('closed');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Add this to initialize the menu in the correct state 
initializeMenu() {
  const sideMenu = document.getElementById('side-menu');
  const overlay = document.querySelector('.side-menu-overlay');

  if (sideMenu) {
    // Ensure it starts hidden by class only
    sideMenu.classList.remove('open');
    sideMenu.classList.add('closed');

    // Clear any leftover inline styles
    sideMenu.style.transform = '';
    sideMenu.style.left = '';
    sideMenu.style.right = ''; // let CSS handle positioning
  }

  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = ''; // let CSS handle display
  }
}

   showApp() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer) {
        authContainer.style.display = 'none';
        authContainer.classList.remove('active');
    }
    if (appContainer) {
        appContainer.style.display = 'block';
        appContainer.classList.remove('hidden');
    }
    
    // CRITICAL: Update body classes
    document.body.classList.add('app-active');
    document.body.classList.remove('auth-visible', 'loading');
    
    console.log('🏠 App container shown');
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
                <!-- Brand/logo -->
                <div class="nav-brand">
                    <img src="icons/icon-96x96_a.png" alt="AgriMetrics">
                    <span class="brand-text">AgriMetrics</span>
                    <span class="brand-subtitle">Farm Management System</span>
                </div>
                
                    <!-- Scrollable icons section -->
                <div class="nav-items-scroll">
                <div class="nav-items">
                    <button class="nav-item" data-view="dashboard" title="Dashboard">
                        <span>📊</span>
                        <span class="nav-label">Dashboard</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" title="Income & Expenses">
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

                    <button class="nav-item dark-mode-toggle" id="dark-mode-toggle" title="Toggle Dark Mode">
                        <span>🌙</span>
                        <span class="nav-label">Theme</span>
                    </button>
                </div>
            </div> 
                <!-- Fixed right controls --> 
                 <div class="nav-actions">
                  <button type="button" id="navbar-logout-btn" class="logout-btn nav-item" title="Logout"> 
                    <span>🚪</span> <span class="nav-label">Logout</span> 
                  </button>
                  <button class="nav-item hamburger-menu" id="hamburger-menu" title="Farm Operations">
                        <span>☰</span>
                        <span class="nav-label">More</span>
                    </button>
                </div>
            </nav>
        `;
         
        // ADD THIS DEBUG LOG
        console.log('🔍 Navbar logout button created:', document.getElementById('navbar-logout-btn'));
    }

setupHamburgerMenu() {
  console.log('🎯 Setting up hamburger menu (class-based version)');

  const hamburger = document.getElementById('hamburger-menu');
  const sideMenu = document.getElementById('side-menu');

  if (!hamburger || !sideMenu) {
    console.log('❌ Hamburger or side menu not found');
    return;
  }

  // Skip if already setup
  if (hamburger.dataset.menuSetup === 'true') {
    console.log('⚠️ Menu already setup, skipping...');
    return;
  }
  hamburger.dataset.menuSetup = 'true';

  // Ensure menu starts closed
  sideMenu.classList.add('closed');

  // Create overlay if missing
  let overlay = document.querySelector('.side-menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'side-menu-overlay';
    document.body.appendChild(overlay);
  }

  // Clone hamburger to remove old listeners
  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);

  // State
  let isMenuOpen = false;

  // Click handler
  newHamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Before click:', sideMenu.className, overlay.className);
      
    if (!isMenuOpen) {
      sideMenu.classList.remove('closed');
      sideMenu.classList.add('open');
      overlay.classList.add('active');
      isMenuOpen = true;
      console.log('✅ Menu opened');
    } else {
      sideMenu.classList.remove('open');
      sideMenu.classList.add('closed');
      overlay.classList.remove('active');
      isMenuOpen = false;
      console.log('✅ Menu closed');
    }
      console.log('After click:', sideMenu.className, overlay.className);
  });

  // Overlay click closes menu
  overlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    sideMenu.classList.add('closed');
    overlay.classList.remove('active');
    isMenuOpen = false;
    console.log('✅ Menu closed via overlay');
  });

  // ESC key closes menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      sideMenu.classList.remove('open');
      sideMenu.classList.add('closed');
      overlay.classList.remove('active');
      isMenuOpen = false;
      console.log('✅ Menu closed with ESC key');
    }
  });
}
    
    showSection(sectionId) {
    console.log(`🔄 Switching to section: ${sectionId}`);
    
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    const cleanSectionId = sectionId.replace('.js', '');
    this.currentSection = cleanSectionId;
    this.setActiveMenuItem(cleanSectionId);
    
    contentArea.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4CAF50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <p>Loading ${cleanSectionId}...</p>
        </div>
    `;
   
    // Load module
    setTimeout(() => {
        if (FarmModules && FarmModules.renderModule) {
            FarmModules.renderModule(cleanSectionId, contentArea);
        } else {
            this.loadFallbackContent(cleanSectionId);
        }
        
        // After module loads, fix positions
        setTimeout(() => {
            this.fixContentPosition();
            this.fixOverflowingForms();
        }, 300);
    }, 100);
}
   
    setActiveMenuItem(sectionId) {
        document.querySelectorAll('.nav-item, .side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');
        
        const activeSideMenuItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideMenuItem) activeSideMenuItem.classList.add('active');
    }
    
    showAuth() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) {
            authContainer.style.display = 'block';
        }
        if (appContainer) {
            appContainer.style.display = 'none';
        }
    }
    
    loadFallbackContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const sectionTitles = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory Check',
            'feed-record': 'Feed Record',
            'broiler-mortality': 'Broiler Mortality',
            'production': 'Production Records',
            'sales-record': 'Sales Record',
            'orders': 'Orders',
            'reports': 'Reports',
            'profile': 'Profile'
        };

        contentArea.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #1a1a1a;">${sectionTitles[sectionId] || sectionId}</h2>
                <p style="color: #666;">Content loading...</p>
            </div>
        `;
    }

    setupLogoutHandlers() {
    console.log('🔧 Setting up logout handlers for all buttons...');
    
    // Method 1: Direct attachment for navbar button (when it exists)
    const attachNavbarLogout = () => {
        const navbarLogout = document.getElementById('navbar-logout-btn');
        if (navbarLogout && !navbarLogout.dataset.listenerAttached) {
            console.log('✅ Attaching direct listener to navbar logout button');
            navbarLogout.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Navbar logout button clicked directly');
                this.performLogout();
            });
            navbarLogout.dataset.listenerAttached = 'true';
        }
    };
    
    // Method 2: Event delegation for any logout button
    document.addEventListener('click', (e) => {
        const logoutBtn = e.target.closest('.logout-btn');
        if (logoutBtn) {
            console.log('🎯 Event delegation caught logout click:', {
                id: logoutBtn.id,
                className: logoutBtn.className,
                tagName: logoutBtn.tagName
            });
            e.preventDefault();
            e.stopPropagation();
            this.performLogout();
        }
    });
    
    // Method 3: Listen for custom logout events
    document.addEventListener('user-logout', () => {
        console.log('📢 Received custom logout event');
        this.performLogout();
    });
    
    // Try attaching to navbar button immediately and periodically
    attachNavbarLogout();
    
    // Keep trying to attach for a few seconds (in case nav loads later)
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
        attempts++;
        attachNavbarLogout();
        
        if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.log('⏱️ Stopped trying to attach navbar listener');
        }
    }, 300);
}
    
   async performLogout() {
    console.log('🔐 PERFORMING LOGOUT SEQUENCE...');
    
    try {
        // Show loading immediately
        this.showLoading();
        
        // 1. Close side menu if open
        this.closeSideMenu();
        
        // 2. Check if we should preserve remember me email
        const rememberEmail = localStorage.getItem('farm_system_remember_email');
        const rememberCheckbox = document.getElementById('remember-me');
        
        // Clear MOST local storage but KEEP remember me email if checkbox is checked
        const itemsToPreserve = {};
        
        if (rememberEmail && rememberCheckbox && rememberCheckbox.checked) {
            itemsToPreserve.farm_system_remember_email = rememberEmail;
            console.log('💾 Preserving remember me email');
        }
        
        // Clear all localStorage
        localStorage.clear();
        
        // Restore items we want to preserve
        Object.keys(itemsToPreserve).forEach(key => {
            localStorage.setItem(key, itemsToPreserve[key]);
        });
        
        // 3. Sign out from Firebase
        if (typeof firebase !== 'undefined' && firebase.auth) {
            console.log('🔥 Signing out from Firebase...');
            await firebase.auth().signOut();
            console.log('✅ Firebase signout successful');
            
            // IMPORTANT: Wait for Firebase to complete signout
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            console.log('⚠️ Firebase not available, proceeding anyway');
        }
        
        // 4. Reset app state
        this.currentUser = null;
        this.authInitialized = false;
        
        // 5. Force UI update - SIMPLIFY THIS
        console.log('🔄 Forcing UI to auth screen...');
        
        // Hide everything app-related
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        const splash = document.getElementById('splash-screen');
        
        if (appContainer) {
            appContainer.style.display = 'none';
            console.log('📦 App container hidden');
        }
        
        if (splash) {
            splash.style.display = 'none';
        }
        
        if (authContainer) {
            authContainer.style.display = 'block';
            // Reset to signin form
            const signin = document.getElementById('signin-form');
            const signup = document.getElementById('signup-form');
            const forgot = document.getElementById('forgot-password-form');
            if (signin) signin.classList.add('active');
            if (signup) signup.classList.remove('active');
            if (forgot) forgot.classList.remove('active');
            console.log('🔐 Auth container shown');
        }
        
        // Clear content area
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = '';
        }
        
        // Also reset the top navigation
        const header = document.querySelector('header');
        if (header) {
            header.remove();
        }
        
        // Reset body classes
        document.body.classList.remove('dark-mode', 'light-mode');
        
        // Hide loading
        this.hideLoading();
        
        console.log('🎉 Logout sequence complete!');
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        this.hideLoading();
        
        // Fallback: force auth screen
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        if (appContainer) appContainer.style.display = 'none';
        if (authContainer) authContainer.style.display = 'block';
    }
}
}
    
// Reacts to Firebase auth state changes
firebase.auth().onAuthStateChanged(user => {
  const dashboard = document.getElementById("dashboard-container");
  const authContainer = document.getElementById("auth-container");

  if (user) {
    if (dashboard) dashboard.style.display = "block";
    if (authContainer) authContainer.style.display = "none";
    window.app.initializeMenu();  // <-- Call app method
    console.log("🎉 User authenticated, showing app...");
  } else {
    if (dashboard) dashboard.style.display = "none";
    if (authContainer) authContainer.style.display = "block";
    window.app.initializeMenu();  // <-- Call app method
    console.log("🔒 No user, showing sign-in form...");
  }
});

 // Force re-initialization after everything else loads
setTimeout(() => {
    if (typeof this.setupHamburgerMenu === 'function') {
        console.log('🔄 Forcing hamburger menu re-initialization...');
        this.setupHamburgerMenu();
    }
}, 2000);

// ==================== AGRIMETRICS SYNC MANAGER ====================
let agrimetricsSyncWorker = null;

// Initialize Agrimetrics sync
async function initAgrimetricsSync() {
    console.log('🌾 Initializing Agrimetrics sync...');
    
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Agrimetrics Service Worker registered');
            
            await navigator.serviceWorker.ready;
            
            navigator.serviceWorker.addEventListener('message', handleAgrimetricsSWMessage);
            
            // Register periodic sync
            if ('periodicSync' in registration) {
                const status = await navigator.permissions.query({
                    name: 'periodic-background-sync',
                });
                
                if (status.state === 'granted') {
                    await registration.periodicSync.register('agrimetrics-periodic-sync', {
                        minInterval: 60 * 60 * 1000 // 1 hour
                    });
                    console.log('Agrimetrics periodic sync registered');
                }
            }
            
            agrimetricsSyncWorker = registration;
            
            // Initial sync
            triggerAgrimetricsSync();
            
            // Online/offline listeners
            window.addEventListener('online', () => {
                console.log('📶 Agrimetrics back online - syncing');
                triggerAgrimetricsSync();
            });
            
            return true;
            
        } catch (error) {
            console.error('Agrimetrics sync initialization failed:', error);
            return false;
        }
    }
    return false;
}

// Handle messages from Service Worker
function handleAgrimetricsSWMessage(event) {
    const { type, timestamp, success, error, data } = event.data;
    
    console.log('📨 Agrimetrics SW message:', type, data);
    
    switch (type) {
        case 'AGRIMETRICS_SYNC_STARTED':
            showAgrimetricsNotification('Syncing data...', 'info');
            updateAgrimetricsSyncStatus('🔄 Syncing...', '#2196F3');
            break;
            
        case 'AGRIMETRICS_SYNC_COMPLETED':
            if (success) {
                showAgrimetricsNotification('Sync complete!', 'success');
                updateAgrimetricsSyncStatus('✅ Synced', '#4CAF50');
                if (typeof loadAgrimetricsData === 'function') {
                    loadAgrimetricsData();
                }
            } else {
                showAgrimetricsNotification('Sync failed', 'error');
                updateAgrimetricsSyncStatus('❌ Failed', '#f44336');
            }
            localStorage.setItem('agrimetricsLastSync', timestamp);
            updateAgrimetricsLastSync();
            break;
            
        case 'AGRIMETRICS_SYNC_FAILED':
            showAgrimetricsNotification(`Sync error: ${error}`, 'error');
            updateAgrimetricsSyncStatus('❌ Error', '#f44336');
            break;
    }
}

// Trigger Agrimetrics background sync
async function triggerAgrimetricsSync() {
    if (!agrimetricsSyncWorker || !agrimetricsSyncWorker.sync) {
        console.log('Agrimetrics background sync not available');
        return false;
    }
    
    try {
        const userData = localStorage.getItem('agrimetricsUser');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        
        // Get current farm/production data
        const syncData = {
            userId: user.uid,
            farmId: localStorage.getItem('currentFarmId'),
            dataType: 'production',
            payload: {
                production: window.agrimetricsData || [],
                lastUpdated: new Date().toISOString()
            }
        };
        
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.active) {
            registration.active.postMessage({
                type: 'QUEUE_AGRIMETRICS_DATA',
                payload: syncData
            });
            
            if (registration.sync) {
                await registration.sync.register('agrimetrics-firestore-sync');
                console.log('✅ Agrimetrics background sync registered');
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('Failed to trigger Agrimetrics sync:', error);
        return false;
    }
}

// Update sync status in UI
function updateAgrimetricsSyncStatus(message, color) {
    const statusElement = document.getElementById('agrimetrics-sync-status');
    if (statusElement) {
        statusElement.innerHTML = `<span style="color: ${color}">${message}</span>`;
    }
}

// Update last sync display
function updateAgrimetricsLastSync() {
    const lastSync = localStorage.getItem('agrimetricsLastSync');
    const element = document.getElementById('agrimetrics-last-sync');
    
    if (element && lastSync) {
        const date = new Date(lastSync);
        element.textContent = `Last sync: ${date.toLocaleString()}`;
    }
}

// Show notification
function showAgrimetricsNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `agrimetrics-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Add CSS animations
const agrimetricsStyle = document.createElement('style');
agrimetricsStyle.textContent = `
    @keyframes agrimetricsSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .agrimetrics-sync-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 5px;
        animation: agrimetricsPulse 2s infinite;
    }
    
    @keyframes agrimetricsPulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(agrimetricsStyle);

// ==================== LOAD ALL FARM DATA FROM FIREBASE ====================
async function loadAllFarmDataFromFirebase() {
    console.log('🔥 LOADING ALL FARM DATA FROM FIREBASE');
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('❌ No user logged in');
            return;
        }
        
        console.log('👤 Loading ALL data for user:', user.uid);
        
        // Show loading notification
        showAgrimetricsNotification('Loading your farm data...', 'info');
        
        // ===== 1. LOAD SALES RECORDS =====
        try {
            const salesSnapshot = await db.collection('sales').doc(user.uid).collection('records').get();
            console.log(`📊 Found ${salesSnapshot.size} sales periods`);
            
            let allSales = [];
            salesSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) allSales = allSales.concat(data.entries);
                else if (data.sales) allSales = allSales.concat(data.sales);
                else if (Array.isArray(data)) allSales = allSales.concat(data);
            });
            
            if (allSales.length > 0) {
                window.salesData = allSales;
                localStorage.setItem('salesData', JSON.stringify(allSales));
                console.log(`✅ Loaded ${allSales.length} sales records`);
            }
        } catch (e) {
            console.log('Error loading sales:', e);
        }
        
        // ===== 2. LOAD PRODUCTION RECORDS =====
        try {
            const productionSnapshot = await db.collection('production').doc(user.uid).collection('records').get();
            console.log(`📊 Found ${productionSnapshot.size} production periods`);
            
            let allProduction = [];
            productionSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) allProduction = allProduction.concat(data.entries);
                else if (Array.isArray(data)) allProduction = allProduction.concat(data);
            });
            
            if (allProduction.length > 0) {
                window.productionData = allProduction;
                localStorage.setItem('productionData', JSON.stringify(allProduction));
                console.log(`✅ Loaded ${allProduction.length} production records`);
            }
        } catch (e) {
            console.log('Error loading production:', e);
        }
        
        // ===== 3. LOAD INVENTORY DATA =====
        try {
            const inventoryDoc = await db.collection('inventory').doc(user.uid).get();
            if (inventoryDoc.exists) {
                const data = inventoryDoc.data();
                window.inventoryData = data.items || [];
                localStorage.setItem('inventoryData', JSON.stringify(window.inventoryData));
                console.log(`✅ Loaded ${window.inventoryData.length} inventory items`);
            }
        } catch (e) {
            console.log('Error loading inventory:', e);
        }
        
        // ===== 4. LOAD EXPENSES DATA =====
        try {
            const expensesSnapshot = await db.collection('expenses').doc(user.uid).collection('records').get();
            console.log(`📊 Found ${expensesSnapshot.size} expense periods`);
            
            let allExpenses = [];
            expensesSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries) allExpenses = allExpenses.concat(data.entries);
                else if (Array.isArray(data)) allExpenses = allExpenses.concat(data);
            });
            
            if (allExpenses.length > 0) {
                window.expensesData = allExpenses;
                localStorage.setItem('expensesData', JSON.stringify(allExpenses));
                console.log(`✅ Loaded ${allExpenses.length} expense records`);
            }
        } catch (e) {
            console.log('Error loading expenses:', e);
        }
        
        // Show success
        showAgrimetricsNotification('All farm data loaded!', 'success');
        updateAgrimetricsSyncStatus('✅ Synced', '#4CAF50');
        
    } catch (error) {
        console.error('❌ Error loading farm data:', error);
        showAgrimetricsNotification('Error loading data', 'error');
    }
}

   // Helper to get current sales data (add this near your other global functions)
function getSalesData() {
    return window.salesData || window.currentSalesData || [];
}

// Helper to refresh data from Firebase
async function refreshAllData() {
    console.log('🔄 Refreshing all data from Firebase...');
    await window.app.initializeAppComponents();
}

// Run this in console to SEE what's in Firebase
async function checkMyFirebaseData() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('❌ Login first');
        return;
    }
    
    console.log('🔍 CHECKING ALL YOUR FIREBASE DATA');
    console.log('User ID:', user.uid);
    
    const collections = ['sales', 'production', 'expenses', 'inventory'];
    
    for (const collection of collections) {
        try {
            if (collection === 'inventory') {
                const doc = await db.collection(collection).doc(user.uid).get();
                console.log(`📁 ${collection}:`, doc.exists ? doc.data() : 'No data');
            } else {
                const snapshot = await db.collection(collection).doc(user.uid).collection('records').get();
                console.log(`📁 ${collection}: ${snapshot.size} periods`);
                snapshot.forEach(doc => {
                    console.log(`  - ${doc.id}:`, doc.data());
                });
            }
        } catch (e) {
            console.log(`Error checking ${collection}:`, e);
        }
    }
}

// Run it
checkMyFirebaseData();

// Initialize the app
window.app = new FarmManagementApp();
