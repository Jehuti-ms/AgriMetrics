/**
 * StyleManager - Centralized style management for ALL modules
 * Modern PWA Green Theme for all modules
 * FIXED VERSION WITH ALL MISSING METHODS
 */

const StyleManager = {
    // Current theme and configuration
    currentTheme: 'modern-green',
    modules: new Map(),
    
    // Modern Green PWA Theme
    themes: {
        'modern-green': {
            name: 'Modern Green PWA',
            variables: {
                // Primary Green Colors
                '--primary-50': '#f0fdf4',
                '--primary-100': '#dcfce7',
                '--primary-500': '#22c55e',
                '--primary-600': '#16a34a',
                '--primary-700': '#15803d',
                '--primary-900': '#14532d',
                
                // Semantic Colors
                '--danger-500': '#ef4444',
                '--warning-500': '#f59e0b',
                '--success-500': '#10b981',
                '--info-500': '#3b82f6',
                
                // Modern Gradients
                '--gradient-primary': 'linear-gradient(135deg, #22c55e, #16a34a)',
                '--gradient-primary-hover': 'linear-gradient(135deg, #16a34a, #15803d)',
                '--gradient-danger': 'linear-gradient(135deg, #ef4444, #dc2626)',
                '--gradient-warning': 'linear-gradient(135deg, #f59e0b, #d97706)',
                '--gradient-success': 'linear-gradient(135deg, #10b981, #059669)',
                '--gradient-info': 'linear-gradient(135deg, #3b82f6, #2563eb)',
                '--gradient-mortality': 'linear-gradient(135deg, #ef4444, #dc2626)',
                '--gradient-production': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                
                // Backgrounds
                '--module-bg': 'linear-gradient(135deg, #f8faf9 0%, #f0f7f4 100%)',
                '--card-bg': 'rgba(255, 255, 255, 0.95)',
                '--card-bg-hover': 'rgba(255, 255, 255, 1)',
                '--card-border': 'rgba(255, 255, 255, 0.8)',
                
                // Modern Shadows
                '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
                '--shadow-md': '0 4px 20px rgba(0, 0, 0, 0.1)',
                '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
                '--shadow-xl': '0 12px 40px rgba(0, 0, 0, 0.2)',
                '--shadow-primary': '0 4px 12px rgba(34, 197, 94, 0.3)',
                '--shadow-primary-hover': '0 6px 20px rgba(34, 197, 94, 0.4)',
                
                // Effects
                '--backdrop-blur': 'blur(20px)',
                '--backdrop-blur-light': 'blur(10px)',
                
                // Transitions
                '--transition-fast': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '--transition-normal': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '--transition-slow': 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                
                // Border Radius
                '--radius-sm': '8px',
                '--radius-md': '12px',
                '--radius-lg': '16px',
                '--radius-xl': '20px',
                '--radius-2xl': '24px'
            }
        },
        'dark-mode': {
            name: 'Dark Green',
            variables: {
                '--primary-500': '#4ade80',
                '--primary-600': '#22c55e',
                '--primary-700': '#16a34a',
                '--gradient-primary': 'linear-gradient(135deg, #4ade80, #22c55e)',
                '--gradient-primary-hover': 'linear-gradient(135deg, #22c55e, #16a34a)',
                '--module-bg': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                '--card-bg': 'rgba(30, 41, 59, 0.95)',
                '--card-bg-hover': 'rgba(30, 41, 59, 1)',
                '--card-border': 'rgba(255, 255, 255, 0.1)'
            }
        }
    },

    // Complete Module Configurations
    moduleConfigs: {
        // DASHBOARD MODULE
        'dashboard': {
            name: 'Dashboard',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(200px, 1fr))',
            features: ['welcome-section', 'quick-actions', 'stats-overview', 'recent-activity']
        },
        
        // INCOME & EXPENSES MODULE
        'income-expenses': {
            name: 'Income & Expenses',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(180px, 1fr))',
            features: ['financial-stats', 'quick-transactions', 'transaction-form', 'transactions-list']
        },
        
        // INVENTORY MODULE
        'inventory-check': {
            name: 'Inventory Management',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(180px, 1fr))',
            features: ['inventory-stats', 'quick-actions', 'inventory-form', 'inventory-list', 'low-stock-alerts']
        },
        
        // ORDERS MODULE
        'orders': {
            name: 'Orders Management',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(200px, 1fr))',
            features: ['orders-overview', 'quick-orders', 'orders-filters', 'recent-orders', 'priority-orders']
        },
        
        // SALES MODULE
        'sales-record': {
            name: 'Sales Records',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(200px, 1fr))',
            features: ['sales-stats', 'quick-sales', 'sales-form', 'sales-history', 'customer-insights']
        },
        
        // PRODUCTION MODULE
        'production': {
            name: 'Production Tracking',
            headerGradient: 'var(--gradient-production)',
            statsGrid: 'repeat(auto-fit, minmax(220px, 1fr))',
            features: ['production-stats', 'quick-production', 'production-form', 'production-records', 'quality-metrics']
        },
        
        // FEED MODULE
        'feed-record': {
            name: 'Feed Management',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(200px, 1fr))',
            features: ['feed-stats', 'quick-feed', 'feed-form', 'inventory-tracking', 'consumption-records']
        },
        
        // BROILER MORTALITY MODULE
        'broiler-mortality': {
            name: 'Broiler Mortality',
            headerGradient: 'var(--gradient-mortality)',
            statsGrid: 'repeat(auto-fit, minmax(220px, 1fr))',
            features: ['mortality-stats', 'quick-records', 'mortality-form', 'mortality-records', 'cause-analysis', 'health-alerts']
        },
        
        // REPORTS MODULE
        'reports': {
            name: 'Reports & Analytics',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(200px, 1fr))',
            features: ['quick-stats', 'report-categories', 'report-output', 'recent-activity']
        },
        
        // PROFILE MODULE
        'profile': {
            name: 'Profile',
            headerGradient: 'var(--gradient-primary)',
            statsGrid: 'repeat(auto-fit, minmax(200px, 1fr))',
            features: ['profile-info', 'settings', 'data-management']
        }
    },

    /**
     * Initialize the StyleManager
     */
    init() {
        console.log('🎨 Initializing StyleManager for all modules...');
        
        this.injectBaseStyles();
        this.applyTheme(this.currentTheme);
        // this.setupThemeSwitcher(); // Commented out to remove floating theme switcher
        this.initializeModules();
        
        console.log('✅ StyleManager initialized with all modules');
    },

    /**
     * Inject modern PWA base styles
     */
    injectBaseStyles() {
        const style = document.createElement('style');
        style.id = 'style-manager-base';
        style.textContent = `
            /* Modern PWA Base Styles */
           /* Ensure emoji icons render correctly */
            /* === NAVBAR EMOJI PRESERVE === */
        .nav-item span:first-child {
            font-family: "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Twemoji Mozilla", sans-serif !important;
            font-size: 20px;
            margin-right: 6px;
            line-height: 1;
            display: inline-block;
        }
             .brand-text,
            .brand-subtitle {
              display: inline-block;
              line-height: 1;
              vertical-align: bottom;   /* forces both to align at their bottom edge */
            }
            
        /* Modern PWA Base Styles */
        .module-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 16px;
        }

        .card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 16px;
            margin-bottom: 16px;
        }

           
            .module-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                min-height: calc(100vh - 80px);
                background: var(--module-bg);
            }

            .module-header {
                background: var(--header-gradient, var(--gradient-primary));
                margin: -20px -20px 20px -20px;
                padding: 25px 20px;
                border-radius: 0 0 20px 20px;
                color: white;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }

            .module-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            }

            .module-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 6px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                color: white;
                position: relative;
                z-index: 1;
            }

            .module-subtitle {
                font-size: 14px;
                opacity: 0.9;
                font-weight: 500;
                color: white;
                position: relative;
                z-index: 1;
            }

           

        /* MODERN PWA BUTTONS - GREEN GRADIENT FOR ALL MODULES */
            .btn-primary, 
            .btn.btn-primary, 
            button[class*="primary"],
            button[class*="btn-primary"] {
                background: var(--gradient-primary) !important;
                color: white !important;
                border: none !important;
                padding: 14px 28px !important;
                border-radius: var(--radius-lg) !important;
                font-weight: 700 !important;
                font-size: 14px !important;
                cursor: pointer !important;
                transition: var(--transition-normal) !important;
                box-shadow: var(--shadow-primary) !important;
                position: relative !important;
                overflow: hidden !important;
                backdrop-filter: var(--backdrop-blur-light) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                min-height: 48px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
            }

            .btn-primary::before,
            .btn.btn-primary::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: var(--transition-slow);
            }

            .btn-primary:hover, 
            .btn.btn-primary:hover, 
            button[class*="primary"]:hover,
            button[class*="btn-primary"]:hover {
                background: var(--gradient-primary-hover) !important;
                transform: translateY(-2px) !important;
                box-shadow: var(--shadow-primary-hover) !important;
            }

            .btn-primary:hover::before,
            .btn.btn-primary:hover::before {
                left: 100%;
            }

            /* Ensure no blue overrides */
            .btn-primary[style*="background"],
            .btn-primary[style*="blue"],
            button[style*="blue"] {
                background: var(--gradient-primary) !important;
            }

            /* Secondary buttons */
            .btn-secondary {
                background: var(--card-bg) !important;
                color: var(--text-primary) !important;
                border: 1px solid var(--card-border) !important;
                padding: 14px 28px !important;
                border-radius: var(--radius-lg) !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: var(--transition-normal) !important;
                backdrop-filter: var(--backdrop-blur-light) !important;
            }

            .btn-secondary:hover {
                background: var(--card-bg-hover) !important;
                transform: translateY(-2px) !important;
                box-shadow: var(--shadow-md) !important;
            }

            /* Outline buttons */
            .btn-outline {
                background: transparent !important;
                color: var(--text-primary) !important;
                border: 2px solid var(--primary-500) !important;
                padding: 12px 26px !important;
                border-radius: var(--radius-lg) !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: var(--transition-normal) !important;
            }

            .btn-outline:hover {
                background: var(--primary-500) !important;
                color: white !important;
                transform: translateY(-2px) !important;
            }

            /* Modern Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: var(--stats-grid, repeat(auto-fit, minmax(200px, 1fr)));
                gap: 16px;
                margin-bottom: 20px;
            }

            .stat-card {
                background: var(--card-bg);
                backdrop-filter: var(--backdrop-blur);
                border: 1px solid var(--card-border);
                border-radius: var(--radius-xl);
                padding: 20px;
                text-align: center;
                transition: var(--transition-normal);
                box-shadow: var(--shadow-md);
                position: relative;
                overflow: hidden;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--gradient-primary);
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                background: var(--card-bg-hover);
            }

            /* Modern Glass Cards */
            .glass-card {
                background: var(--card-bg);
                backdrop-filter: var(--backdrop-blur);
                border: 1px solid var(--card-border);
                border-radius: var(--radius-2xl);
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: var(--shadow-md);
                transition: var(--transition-normal);
            }

            .glass-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
                background: var(--card-bg-hover);
            }

            /* Quick Action Buttons */
            .quick-action-btn {
                background: var(--card-bg);
                backdrop-filter: var(--backdrop-blur);
                border: 1px solid var(--card-border);
                border-radius: var(--radius-xl);
                padding: 20px 12px;
                cursor: pointer;
                transition: var(--transition-normal);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                color: inherit;
                box-shadow: var(--shadow-md);
                text-align: center;
                min-height: 110px;
            }

            .quick-action-btn:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: var(--shadow-lg);
                background: var(--card-bg-hover);
            }

            /* Form Styles */
            .form-container {
                background: var(--card-bg);
                backdrop-filter: var(--backdrop-blur);
                border: 1px solid var(--card-border);
                border-radius: var(--radius-2xl);
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: var(--shadow-md);
                border-top: 3px solid var(--primary-500);
            }

            /* List Items */
            .list-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 14px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: var(--radius-lg);
                border: 1px solid rgba(255, 255, 255, 0.6);
                transition: var(--transition-normal);
                cursor: pointer;
            }

            .list-item:hover {
                transform: translateX(4px);
                background: rgba(255, 255, 255, 1);
                box-shadow: var(--shadow-md);
            }

            /* ===== CRITICAL FIXES FROM USER ===== */
        
        /* 1. Welcome text always white */
        .welcome-section,
        .welcome-section * {
            color: white !important;
        }
        
        .welcome-section h1,
        .welcome-section p {
            color: white !important;
        }
        
        .dark-mode .welcome-section,
        .dark-mode .welcome-section * {
            color: white !important;
        }
        
        /* 2. Brand text same gray color */
        .nav-brand .brand-text,
        .nav-brand .brand-subtitle {
            color: #666666 !important;
            font-weight: 600;
        }
        
        .dark-mode .nav-brand .brand-text,
        .dark-mode .nav-brand .brand-subtitle {
            color: #cbd5e1 !important;
        }
        
        .nav-brand .brand-subtitle {
            font-size: 11px;
            opacity: 0.9;
        }
        
        .dark-mode .nav-brand .brand-subtitle {
            opacity: 0.8;
        }
        
        /* 3. Dark mode hover fix (dark gray, not white) */
        .dark-mode .nav-item:hover {
            background: rgba(71, 85, 105, 0.3) !important;
            color: #f8fafc !important;
        }
        
        .dark-mode .nav-item:hover span {
            color: #f8fafc !important;
        }
        
        .dark-mode .side-menu-item:hover {
            background: rgba(71, 85, 105, 0.3) !important;
            color: #f8fafc !important;
        }
        
        .dark-mode .hamburger-menu:hover {
            background: rgba(71, 85, 105, 0.3) !important;
            color: #f8fafc !important;
        }
        
        .dark-mode .btn-icon:hover {
            background: rgba(71, 85, 105, 0.3) !important;
            color: #f8fafc !important;
        }
        
        /* 4. Navigation button sizes (not too wide) */
        .nav-items {
            gap: 4px !important;
            padding: 0 4px !important;
        }
        
        .nav-item {
            padding: 6px 8px !important;
            min-width: 60px !important;
            max-width: 80px !important;
            white-space: nowrap;
        }
        
        .nav-label {
            font-size: 10px !important;
            margin-top: 2px !important;
        }
        
        /* 5. Profile buttons (horizontal, not stretched) */
        .profile-module .action-buttons {
            display: flex !important;
            flex-direction: row !important;
            gap: 10px !important;
            flex-wrap: wrap !important;
        }
        
        .profile-module .btn-primary,
        .profile-module .btn-outline {
            width: auto !important;
            min-width: 120px !important;
            max-width: 200px !important;
            flex: 0 1 auto !important;
        }
        
        /* 6. Recent activity text size (smaller) */
        .activity-list > div div:first-child {
            font-size: 28px !important;
            margin-bottom: 8px !important;
        }
        
        .activity-list > div div:nth-child(2) {
            font-size: 13px !important;
            margin-bottom: 4px !important;
        }
        
        .activity-list > div div:last-child {
            font-size: 11px !important;
        }

        /* ==============================================================
           Top Navigation (StyleManager owns this now)
           ============================================================== */
 /* Top navigation bar */
.top-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: #fff;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Brand pinned left */
.nav-brand {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

/* Scrollable middle section */
.nav-items-scroll {
  flex: 1 1 auto;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  position: relative;
}
.nav-items-scroll::-webkit-scrollbar { display: none; }
.nav-items-scroll { scrollbar-width: none; -ms-overflow-style: none; }

.nav-items {
  display: flex;
}
.nav-item {
  flex: 0 0 auto;
  margin: 0 8px;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav-label { font-size: 12px; margin-top: 2px; }

/* Fixed right controls */
.nav-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
.nav-actions .nav-item { margin-left: 8px; }

/* Subtle fade hints for scroll */
.nav-items-scroll::before,
.nav-items-scroll::after {
  content: "";
  position: absolute;
  top: 0;
  width: 24px;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.nav-items-scroll::before {
  left: 0;
  background: linear-gradient(to right, #fff, transparent);
}
.nav-items-scroll::after {
  right: 0;
  background: linear-gradient(to left, #fff, transparent);
}

/* Brand section */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-brand img {
  height: 50px;
  width: 50px;
}

.brand-text {
  font-weight: 700;
  font-size: 16px;
  color: #1a1a1a;
}

.brand-subtitle {
  font-size: 12px;
  color: #666;
}

/* Nav items container */
.nav-items {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

/* Individual nav item */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 6px 8px;
  border: none;
  background: none;
  cursor: pointer;
}

.nav-item span:first-child {
  font-size: 20px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  line-height: 1;
}

/* Hover/active states */
.nav-item:hover {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--primary-dark);
}

.nav-item.active {
  background: rgba(34, 197, 94, 0.1);
  color: var(--primary-dark);
}

/* ============== Header Fix ============= */
/* Content offset so sections don’t hide under navbar */
#app-container main,
#content-area {
 padding-top: 60px; /* equal to navbar height */
}

/* Ensure ALL module headers sit just below the navbar */
.module-header,
.module-header-pwa,
.welcome-section {
  margin-top: 68px;   /* 60px navbar height + 8px breathing room */
  padding: 12px 20px; /* consistent internal spacing */
  border-radius: 0 0 20px 20px; /* rounded only at bottom */
  position: relative;
}



      
        `;
        document.head.appendChild(style);
    },

    /**
     * Apply theme to all modules
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found`);
            return;
        }

        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        const root = document.documentElement;

        // Apply CSS variables to root
        Object.entries(theme.variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Update all registered modules
        this.updateAllModules();
        
        console.log(`🎨 Applied ${theme.name} theme to all modules`);
        this.emit('themeChanged', { theme: themeName, themeData: theme });
    },

    /**
     * Initialize all module configurations
     */
    initializeModules() {
        Object.entries(this.moduleConfigs).forEach(([moduleId, config]) => {
            this.modules.set(moduleId, {
                ...config,
                active: false,
                element: null,
                instance: null
            });
        });
    },

    /**
     * Register a module with the StyleManager (FIXED VERSION)
     */
    registerModule(moduleId, element, instance = null) {
        const config = this.moduleConfigs[moduleId];
        if (config) {
            console.log(`✅ StyleManager: Registered ${config.name} module`);
        } else {
            console.log(`✅ StyleManager: Registered ${moduleId} module`);
        }
        
        if (element) {
            this.applyModuleStyles(moduleId, element);
        }
        return true;
    },

    /**
     * Register a component with the StyleManager (NEW METHOD)
     */
    registerComponent(moduleName) {
        console.log(`🎨 StyleManager: ${moduleName} component registered`);
        return true;
    },

    /**
     * Apply module-specific styles (FIXED VERSION)
     */
    applyModuleStyles(moduleId, element) {
        if (!element) return;
        
        // Add base module class
        element.classList.add('module-container');
        
        // Apply theme variables
        const theme = this.themes[this.currentTheme];
        if (theme && theme.variables) {
            Object.entries(theme.variables).forEach(([key, value]) => {
                element.style.setProperty(key, value);
            });
        }
    },

    /**
     * Update all active modules with current theme
     */
    updateAllModules() {
        this.modules.forEach((module, moduleId) => {
            if (module.active && module.element) {
                this.applyModuleStyles(moduleId, module.element);
                
                // Notify module instance if it exists
                if (module.instance && typeof module.instance.onThemeChange === 'function') {
                    module.instance.onThemeChange(this.currentTheme);
                }
            }
        });
    },

    /**
     * Setup theme switcher in UI (COMMENTED OUT TO REMOVE FLOATING THEME)
     */
    setupThemeSwitcher() {
        // This creates the floating theme switcher - commented out to remove it
        console.log('🎨 Theme switcher disabled');
        return;
        
      
    },

    /**
     * Get current theme information
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            data: this.themes[this.currentTheme]
        };
    },

    /**
     * Get module information
     */
    getModuleInfo(moduleId) {
        return this.modules.get(moduleId);
    },

    /**
     * Get all active modules
     */
    getActiveModules() {
        return Array.from(this.modules.values()).filter(module => module.active);
    },

    /**
     * Get all registered modules
     */
    getAllModules() {
        return Array.from(this.modules.values());
    },

    /**
     * Event system for style changes
     */
    emit(event, data) {
        const customEvent = new CustomEvent(`styleManager:${event}`, { detail: data });
        document.dispatchEvent(customEvent);
    },

    /**
     * Listen for style events
     */
    on(event, callback) {
        document.addEventListener(`styleManager:${event}`, callback);
    },

    /**
     * Remove event listener
     */
    off(event, callback) {
        document.removeEventListener(`styleManager:${event}`, callback);
    },

    /**
     * Add custom theme dynamically
     */
    addTheme(themeId, themeData) {
        this.themes[themeId] = themeData;
        console.log(`✅ Added custom theme: ${themeData.name}`);
    },

    /**
     * Add custom module configuration
     */
    addModuleConfig(moduleId, config) {
        this.moduleConfigs[moduleId] = config;
        console.log(`✅ Added module config: ${config.name}`);
    }
};

// Make it globally available
window.StyleManager = StyleManager;

console.log('✅ StyleManager loaded with all fixes');
