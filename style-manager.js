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

            /* ===== UNIFIED BUTTON CONTAINER STYLES FOR ALL MODULES ===== */
.form-actions,
.module-form-actions,
.quick-action-buttons,
div[class*="form-actions"],
div[class*="button-container"],
div[class*="btn-container"] {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-top: 20px !important;
    width: 100% !important;
}

/* Primary buttons (Save, Create, Add, Update) */
.form-actions .btn-primary,
.module-form-actions .btn-primary,
button[type="submit"],
#save-production-btn,
#save-btn,
#create-btn,
#add-btn,
#update-btn,
.btn-primary[type="submit"] {
    flex: 1 1 auto !important;
    min-width: 140px !important;
    order: 1 !important;
    background: var(--gradient-primary) !important;
}

/* Cancel/Secondary buttons */
.form-actions .btn-outline,
.module-form-actions .btn-outline,
#cancel-btn,
#cancel-production-btn,
#cancel-order-form,
#cancel-customer-form,
#cancel-feed-form,
#cancel-edit-btn,
.btn-outline[type="button"] {
    flex: 0 1 auto !important;
    min-width: 100px !important;
    order: 2 !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .form-actions,
    .module-form-actions,
    .quick-action-buttons,
    div[class*="form-actions"],
    div[class*="button-container"],
    div[class*="btn-container"] {
        flex-direction: column !important;
        gap: 8px !important;
    }
    
    .form-actions .btn-primary,
    .module-form-actions .btn-primary,
    button[type="submit"],
    .form-actions .btn-outline,
    .module-form-actions .btn-outline,
    #save-production-btn, #cancel-production-btn,
    #save-btn, #cancel-btn,
    #create-btn, #cancel-order-form,
    #add-btn, #cancel-customer-form,
    #update-btn, #cancel-feed-form,
    #cancel-edit-btn {
        flex: 1 1 100% !important;
        width: 100% !important;
    }
    
    /* Ensure proper stacking order */
    .form-actions .btn-primary,
    button[type="submit"],
    #save-production-btn, #save-btn,
    #create-btn, #add-btn, #update-btn {
        order: 1 !important;
    }
    
    .form-actions .btn-outline,
    #cancel-production-btn, #cancel-btn,
    #cancel-order-form, #cancel-customer-form,
    #cancel-feed-form, #cancel-edit-btn {
        order: 2 !important;
    }
}

/* Specific module overrides */
#order-form .form-actions,
#customer-form .form-actions,
#feed-record-form .form-actions,
#production-form .form-actions,
#inventory-form .form-actions,
#sales-form .form-actions {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    justify-content: flex-end !important;
    margin-top: 20px !important;
}

/* Ensure buttons are properly sized */
.btn-primary, .btn-outline {
    padding: 12px 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: var(--radius-lg) !important;
    transition: var(--transition-normal) !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    white-space: nowrap !important;
}

/* Small screen adjustments */
@media (max-width: 480px) {
    .btn-primary, .btn-outline {
        padding: 10px 16px !important;
        font-size: 13px !important;
        white-space: normal !important;
        word-break: break-word !important;
    }
}

/* Hover effects */
.btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-primary-hover) !important;
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

/* Base modal responsiveness */
@media (max-width: 768px) {
  .report-modal,
  .popout-modal-content {
    width: 95% !important;
    max-width: none !important;
    margin: 0 auto !important;
    border-radius: 12px;
    padding: 16px !important;
  }

  /* Modal header */
  .report-modal h2,
  .report-modal h3 {
    font-size: 1.2rem !important;
    text-align: center;
  }

  /* Action buttons stack vertically */
  .report-modal .action-buttons,
  .report-modal .report-actions {
    flex-direction: column !important;
    gap: 12px !important;
    width: 100%;
  }

  .report-modal .action-buttons button,
  .report-modal .report-actions button {
    width: 100% !important;
  }

  /* Scrollable content */
  .report-modal .report-content,
  .report-modal .output-content {
    max-height: 70vh;
    overflow-y: auto;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .report-modal,
  .popout-modal-content {
    padding: 12px !important;
    border-radius: 8px;
  }

  .report-modal h2,
  .report-modal h3 {
    font-size: 1rem !important;
  }
}

/* Tables inside modals */
@media (max-width: 768px) {
  .report-modal .data-table,
  .popout-modal-content .data-table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .report-modal .data-table th,
  .report-modal .data-table td {
    white-space: nowrap; /* prevent text wrapping that breaks layout */
    font-size: 0.9rem;
    padding: 0.5rem;
  }
}

/* Charts inside modals */
@media (max-width: 768px) {
  .report-modal .chart-container,
  .popout-modal-content .chart-container {
    width: 100% !important;
    height: auto !important;
    max-height: 300px; /* keep charts visible without overflowing */
  }

  .report-modal canvas,
  .popout-modal-content canvas,
  .report-modal svg,
  .popout-modal-content svg {
    width: 100% !important;
    height: auto !important;
  }
}

 /* Responsive report modal buttons */
@media (max-width: 768px) {
  /* Target any flex container directly inside report modals */
  .report-modal div[style*="display: flex"],
  .popout-modal-content div[style*="display: flex"] {
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }

  /* Make buttons full width */
  .report-modal .btn-outline,
  .popout-modal-content .btn-outline,
  #print-report-btn,
  #export-report-btn,
  #email-report-btn,
  #pdf-report-btn,
  #close-report-btn {
    width: 100% !important;
    text-align: center;
  }
}

@media (max-width: 768px) {
  div[style*="display: flex"] {
    flex-direction: column !important;
    align-items: stretch !important;
  }
}

   /* ===========================
       Unified Theme Styles
       =========================== */

    /* Light Mode */
    body.light-mode {
      background-color: #ffffff;
      color: #111827;
    }

    body.light-mode #app-container,
    body.light-mode #content-area,
    body.light-mode main,
    body.light-mode .module-container {
      background-color: #f8faf9 !important;
      color: #111827 !important;
      border: 1px solid #e5e7eb !important;
    }

    body.light-mode nav.top-nav,
    body.light-mode #side-menu {
      background-color: #ffffff !important;
      color: #111827 !important;
      border-bottom: 1px solid #e5e7eb !important;
    }

    body.light-mode .nav-brand .brand-text,
    body.light-mode .nav-brand .brand-subtitle {
      color: #111827 !important;
    }

    body.light-mode .card,
    body.light-mode .glass-card,
    body.light-mode .form-container,
    body.light-mode .popout-modal-content,
    body.light-mode .stat-card {
      background-color: #ffffff !important;
      color: #111827 !important;
      border: 1px solid #e5e7eb !important;
    }

    body.light-mode input,
    body.light-mode select,
    body.light-mode textarea {
      background-color: #ffffff !important;
      color: #111827 !important;
      border: 1px solid #d1d5db !important;
    }

    body.light-mode button,
    body.light-mode .btn {
      background-color: #f9fafb !important;
      color: #111827 !important;
      border: 1px solid #d1d5db !important;
    }

    body.light-mode table,
    body.light-mode th,
    body.light-mode td {
      background-color: #ffffff !important;
      color: #111827 !important;
      border-color: #e5e7eb !important;
    }

    /* Dark Mode */
    body.dark-mode {
      background-color: #0f172a !important;
      color: #f8fafc !important;
    }

    body.dark-mode #app-container,
    body.dark-mode #content-area,
    body.dark-mode main,
    body.dark-mode .module-container {
      background-color: #0f172a !important;   /* ✅ restored dark container */
      color: #f8fafc !important;
      border: 1px solid #333 !important;
    }

    body.dark-mode nav.top-nav,
    body.dark-mode #side-menu {
      background-color: #1c1c1c !important;
      color: #f0f0f0 !important;
      border-bottom: 1px solid #333 !important;
    }

    body.dark-mode .nav-brand .brand-text,
    body.dark-mode .nav-brand .brand-subtitle {
      color: #cbd5e1 !important;  /* ✅ restored brand text visibility */
    }

    body.dark-mode .card,
    body.dark-mode .glass-card,
    body.dark-mode .form-container,
    body.dark-mode .popout-modal-content,
    body.dark-mode .stat-card {
      background-color: #1e1e1e !important;
      color: #f0f0f0 !important;
      border: 1px solid #333 !important;
    }

    body.dark-mode input,
    body.dark-mode select,
    body.dark-mode textarea {
      background-color: #2a2a2a !important;
      color: #f0f0f0 !important;
      border: 1px solid #444 !important;
    }

    body.dark-mode button,
    body.dark-mode .btn {
      background-color: #2a2a2a !important;
      color: #f0f0f0 !important;
      border: 1px solid #444 !important;
    }

    body.dark-mode table,
    body.dark-mode th,
    body.dark-mode td {
      background-color: #1e1e1e !important;
      color: #f0f0f0 !important;
      border-color: #333 !important;
    }

    body.dark-mode .activity-list,
    body.dark-mode .activity-item {
      background-color: #1e1e1e !important;
      color: #f0f0f0 !important;
      border: 1px solid #333 !important;
    }

    body.dark-mode .activity-title,
    body.dark-mode .activity-description,
    body.dark-mode .activity-meta {
      color: #cbd5e1 !important;
    }


/* ===== SPECIFIC FIX FOR SALES MODAL AND ALL POPOUT MODALS ===== */
.popout-modal-footer {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    margin-top: 24px !important;
    padding-top: 20px !important;
    border-top: 2px solid var(--primary-100, #dcfce7) !important;
    width: 100% !important;
    min-height: 80px !important;
}

/* Target buttons with btn class inside modal footer */
.popout-modal-footer .btn {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 12px 28px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: var(--radius-lg, 12px) !important;
    min-width: 100px !important;
    min-height: 48px !important;
    margin: 0 !important;
    cursor: pointer !important;
    transition: var(--transition-normal, all 0.3s) !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    flex: 0 1 auto !important;
    border: none !important;
}

/* Primary button */
.popout-modal-footer .btn.btn-primary {
    background: var(--gradient-primary, linear-gradient(135deg, #22c55e, #16a34a)) !important;
    color: white !important;
    box-shadow: var(--shadow-primary, 0 4px 12px rgba(34, 197, 94, 0.3)) !important;
}

/* Outline button */
.popout-modal-footer .btn.btn-outline {
    background: transparent !important;
    color: var(--text-primary, #111827) !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
}

/* Danger button */
.popout-modal-footer .btn.btn-danger {
    background: var(--gradient-danger, linear-gradient(135deg, #ef4444, #dc2626)) !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
}

/* Hidden class handling */
.popout-modal-footer .btn.hidden,
.popout-modal-footer .hidden {
    display: none !important;
}

/* Hover states */
.popout-modal-footer .btn.btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-primary-hover, 0 6px 20px rgba(34, 197, 94, 0.4)) !important;
}

.popout-modal-footer .btn.btn-outline:hover {
    background: var(--primary-500, #22c55e) !important;
    color: white !important;
    transform: translateY(-2px) !important;
    border-color: var(--primary-500, #22c55e) !important;
}

.popout-modal-footer .btn.btn-danger:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
}

/* Active states */
.popout-modal-footer .btn:active {
    transform: translateY(0) !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .popout-modal-footer {
        flex-direction: column !important;
        gap: 8px !important;
        min-height: auto !important;
    }
    
    .popout-modal-footer .btn {
        width: 100% !important;
        flex: 1 1 100% !important;
        min-width: 100% !important;
        white-space: normal !important;
        word-break: break-word !important;
        padding: 14px 20px !important;
    }
    
    /* Stack order: Save on top, Cancel middle, Delete bottom */
    .popout-modal-footer .btn.btn-primary {
        order: 1 !important;
    }
    
    .popout-modal-footer .btn.btn-outline {
        order: 2 !important;
    }
    
    .popout-modal-footer .btn.btn-danger {
        order: 3 !important;
    }
}

/* Small mobile screens */
@media (max-width: 480px) {
    .popout-modal-footer .btn {
        padding: 12px 16px !important;
        font-size: 13px !important;
    }
}

/* When delete button becomes visible */
.popout-modal-footer .btn.btn-danger:not(.hidden) {
    display: inline-flex !important;
}

/* Ensure proper spacing when delete is hidden */
.popout-modal-footer .btn.btn-primary,
.popout-modal-footer .btn.btn-outline {
    margin: 0 !important;
}

/* ===== PRODUCTION REPORT MODAL FIX ===== */
.production-report-modal,
.report-modal,
[class*="production-report"],
[class*="report-modal"] {
    max-width: 600px !important;
    width: 90% !important;
    margin: 20px auto !important;
    background: var(--card-bg, white) !important;
    border-radius: var(--radius-xl, 16px) !important;
    box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1)) !important;
    padding: 24px !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
}

/* Production report header */
.production-report-modal .modal-header,
.report-modal .modal-header,
.production-report-modal h2,
.production-report-modal h3 {
    color: var(--text-primary, #111827) !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    margin-bottom: 20px !important;
    padding-bottom: 16px !important;
    border-bottom: 2px solid var(--primary-100, #dcfce7) !important;
}

/* Production report body */
.production-report-modal .modal-body,
.report-modal .report-content {
    margin-bottom: 20px !important;
    padding: 8px 0 !important;
}

/* ===== PRODUCTION REPORT MODAL FOOTER FIX ===== */
#production-report-modal .popout-modal-footer,
.production-report-modal .popout-modal-footer,
div[id*="production-report"] .popout-modal-footer {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    margin-top: 24px !important;
    padding-top: 20px !important;
    border-top: 2px solid var(--primary-100, #dcfce7) !important;
    width: 100% !important;
    min-height: 80px !important;
}

/* Style the print button (outline) */
#production-report-modal .btn-outline,
.production-report-modal .btn-outline {
    background: transparent !important;
    color: var(--text-primary, #111827) !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
    padding: 12px 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: var(--radius-lg, 12px) !important;
    min-width: 100px !important;
    min-height: 48px !important;
    cursor: pointer !important;
    transition: var(--transition-normal, all 0.3s) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
}

/* Style the close button (primary) */
#production-report-modal .btn-primary,
.production-report-modal .btn-primary {
    background: var(--gradient-primary, linear-gradient(135deg, #22c55e, #16a34a)) !important;
    color: white !important;
    border: none !important;
    padding: 12px 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: var(--radius-lg, 12px) !important;
    min-width: 100px !important;
    min-height: 48px !important;
    cursor: pointer !important;
    transition: var(--transition-normal, all 0.3s) !important;
    box-shadow: var(--shadow-primary, 0 4px 12px rgba(34, 197, 94, 0.3)) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
}

/* Hover effects */
#production-report-modal .btn-outline:hover,
.production-report-modal .btn-outline:hover {
    background: var(--primary-500, #22c55e) !important;
    color: white !important;
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1)) !important;
}

#production-report-modal .btn-primary:hover,
.production-report-modal .btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-primary-hover, 0 6px 20px rgba(34, 197, 94, 0.4)) !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    #production-report-modal .popout-modal-footer,
    .production-report-modal .popout-modal-footer {
        flex-direction: column !important;
        gap: 8px !important;
        min-height: auto !important;
    }
    
    #production-report-modal .btn-outline,
    #production-report-modal .btn-primary,
    .production-report-modal .btn-outline,
    .production-report-modal .btn-primary {
        width: 100% !important;
        min-width: 100% !important;
        white-space: normal !important;
        word-break: break-word !important;
        padding: 14px 20px !important;
    }
    
    /* Stack order: Print on top, Close below */
    #production-report-modal .btn-outline,
    .production-report-modal .btn-outline {
        order: 1 !important;
    }
    
    #production-report-modal .btn-primary,
    .production-report-modal .btn-primary {
        order: 2 !important;
    }
}

/* Small mobile screens */
@media (max-width: 480px) {
    #production-report-modal .btn-outline,
    #production-report-modal .btn-primary,
    .production-report-modal .btn-outline,
    .production-report-modal .btn-primary {
        padding: 12px 16px !important;
        font-size: 13px !important;
    }
}

/* Animation for modal appearance */
#production-report-modal,
.production-report-modal {
    animation: modalFadeIn 0.3s ease-out !important;
}

/* ===== ULTIMATE POPOUT MODAL BUTTON FIX - FOR ALL MODULES ===== */
/* This forces ALL modal buttons to be visible and properly styled */

/* Target any popout modal in any module */
.popout-modal,
.popout-modal-content,
.modal-content,
.report-modal,
[class*="popout-modal"],
[class*="modal-content"],
[class*="report-modal"],
[class*="dialog"] {
    background: var(--card-bg, white) !important;
    border-radius: var(--radius-xl, 16px) !important;
    padding: 24px !important;
    box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1)) !important;
    z-index: 10000 !important;
}

/* FORCE ALL MODAL FOOTERS TO DISPLAY PROPERLY */
.popout-modal-footer,
.modal-footer,
.report-footer,
[class*="modal-footer"],
[class*="dialog-footer"] {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    margin-top: 24px !important;
    padding-top: 20px !important;
    border-top: 2px solid var(--primary-100, #dcfce7) !important;
    width: 100% !important;
    min-height: 80px !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* FORCE ALL MODAL BUTTONS TO BE VISIBLE */
.popout-modal-footer button,
.modal-footer button,
.report-footer button,
[class*="modal-footer"] button,
[class*="dialog-footer"] button,
.popout-modal-footer .btn,
.modal-footer .btn,
.report-footer .btn,
.popout-modal-footer .btn-outline,
.modal-footer .btn-outline,
.report-footer .btn-outline,
.popout-modal-footer .btn-primary,
.modal-footer .btn-primary,
.report-footer .btn-primary,
.popout-modal-footer .btn-danger,
.modal-footer .btn-danger,
.report-footer .btn-danger {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 12px 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: var(--radius-lg, 12px) !important;
    min-width: 100px !important;
    min-height: 48px !important;
    margin: 0 !important;
    cursor: pointer !important;
    transition: var(--transition-normal, all 0.3s) !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    border: none !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    z-index: 10001 !important;
}

/* PRIMARY BUTTON STYLES */
.popout-modal-footer .btn-primary,
.modal-footer .btn-primary,
.report-footer .btn-primary,
.popout-modal-footer .btn.btn-primary,
button.btn-primary {
    background: var(--gradient-primary, linear-gradient(135deg, #22c55e, #16a34a)) !important;
    color: white !important;
    box-shadow: var(--shadow-primary, 0 4px 12px rgba(34, 197, 94, 0.3)) !important;
}

/* OUTLINE BUTTON STYLES */
.popout-modal-footer .btn-outline,
.modal-footer .btn-outline,
.report-footer .btn-outline,
.popout-modal-footer .btn.btn-outline,
button.btn-outline {
    background: transparent !important;
    color: var(--text-primary, #111827) !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
}

/* DANGER BUTTON STYLES */
.popout-modal-footer .btn-danger,
.modal-footer .btn-danger,
.report-footer .btn-danger,
.popout-modal-footer .btn.btn-danger,
button.btn-danger {
    background: var(--gradient-danger, linear-gradient(135deg, #ef4444, #dc2626)) !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
}

/* HOVER STATES */
.popout-modal-footer .btn-primary:hover,
.modal-footer .btn-primary:hover,
.report-footer .btn-primary:hover,
button.btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-primary-hover, 0 6px 20px rgba(34, 197, 94, 0.4)) !important;
}

.popout-modal-footer .btn-outline:hover,
.modal-footer .btn-outline:hover,
.report-footer .btn-outline:hover,
button.btn-outline:hover {
    background: var(--primary-500, #22c55e) !important;
    color: white !important;
    transform: translateY(-2px) !important;
}

.popout-modal-footer .btn-danger:hover,
.modal-footer .btn-danger:hover,
.report-footer .btn-danger:hover,
button.btn-danger:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
}

/* ===== SPECIFIC MODULE FIXES ===== */

/* PRODUCTION MODULE FIX */
#production-report-modal .popout-modal-footer,
.production-report-modal .popout-modal-footer,
div[id*="production"] .popout-modal-footer {
    display: flex !important;
    justify-content: flex-end !important;
}

#production-report-modal .btn-outline,
.production-report-modal .btn-outline,
button#print-production-report {
    background: transparent !important;
    color: var(--text-primary, #111827) !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
}

#production-report-modal .btn-primary,
.production-report-modal .btn-primary,
button#close-production-report-btn {
    background: var(--gradient-primary, linear-gradient(135deg, #22c55e, #16a34a)) !important;
    color: white !important;
}

/* SALES MODULE FIX */
#sales-modal .popout-modal-footer,
.sales-modal .popout-modal-footer,
div[id*="sale"] .popout-modal-footer {
    display: flex !important;
}

#sales-modal .btn-outline,
button#cancel-sale {
    background: transparent !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
}

#sales-modal .btn-primary,
button#save-sale {
    background: var(--gradient-primary) !important;
    color: white !important;
}

#sales-modal .btn-danger,
button#delete-sale {
    background: var(--gradient-danger) !important;
    color: white !important;
}

/* INVENTORY MODULE FIX */
#inventory-modal .popout-modal-footer,
.inventory-modal .popout-modal-footer,
button#close-inventory-report-btn {
    background: var(--gradient-primary) !important;
    color: white !important;
}

/* ORDERS MODULE FIX */
#order-modal .popout-modal-footer,
.orders-modal .popout-modal-footer,
button#cancel-order,
button#cancel-order-form {
    background: transparent !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
}

button#save-order,
button#create-order,
button#update-order {
    background: var(--gradient-primary) !important;
    color: white !important;
}

/* FEED MODULE FIX */
#feed-modal .popout-modal-footer,
.feed-modal .popout-modal-footer,
button#cancel-feed,
button#cancel-feed-form {
    background: transparent !important;
    border: 2px solid var(--primary-500, #22c55e) !important;
}

button#save-feed,
button#save-feed-record {
    background: var(--gradient-primary) !important;
    color: white !important;
}

/* ===== MOBILE RESPONSIVENESS FOR ALL MODALS ===== */
@media (max-width: 768px) {
    .popout-modal-footer,
    .modal-footer,
    .report-footer,
    [class*="modal-footer"],
    [class*="dialog-footer"] {
        flex-direction: column !important;
        gap: 8px !important;
        min-height: auto !important;
    }
    
    .popout-modal-footer button,
    .modal-footer button,
    .report-footer button,
    [class*="modal-footer"] button,
    .popout-modal-footer .btn,
    .modal-footer .btn,
    .report-footer .btn {
        width: 100% !important;
        min-width: 100% !important;
        white-space: normal !important;
        word-break: break-word !important;
        padding: 14px 20px !important;
    }
    
    /* Universal stacking order: Primary first, then outline, then danger */
    .popout-modal-footer .btn-primary,
    .modal-footer .btn-primary,
    .report-footer .btn-primary,
    button[class*="primary"] {
        order: 1 !important;
    }
    
    .popout-modal-footer .btn-outline,
    .modal-footer .btn-outline,
    .report-footer .btn-outline,
    button[class*="outline"] {
        order: 2 !important;
    }
    
    .popout-modal-footer .btn-danger,
    .modal-footer .btn-danger,
    .report-footer .btn-danger,
    button[class*="danger"] {
        order: 3 !important;
    }
}

/* ===== FIX PRODUCTION REPORT MODAL HEADER TEXT COLOR ===== */
#production-report-modal h3,
.production-report-modal h3,
#production-report-modal .modal-header h3,
.production-report-modal .modal-header h3,
#production-report-modal .popout-modal-header h3,
.production-report-modal .popout-modal-header h3,
div[id*="production-report"] h3 {
    color: var(--text-primary, #111827) !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    margin-bottom: 20px !important;
    padding-bottom: 16px !important;
    border-bottom: 2px solid var(--primary-100, #dcfce7) !important;
    background: transparent !important;
    text-shadow: none !important;
}

/* Also fix any other text in the modal */
#production-report-modal p,
#production-report-modal label,
#production-report-modal span,
#production-report-modal div:not(.module-header):not(.btn-primary):not(.btn-outline) {
    color: var(--text-primary, #111827) !important;
}

/* Override any module header styles that might be leaking in */
#production-report-modal .module-header,
#production-report-modal .module-title,
#production-report-modal .module-subtitle {
    all: revert !important;
    color: var(--text-primary, #111827) !important;
    background: transparent !important;
}

/* Ensure the modal content has proper text color */
#production-report-modal .popout-modal-content,
.production-report-modal .popout-modal-content {
    background: var(--card-bg, white) !important;
    color: var(--text-primary, #111827) !important;
}

/* Keep button text colors as they should be */
#production-report-modal .btn-primary,
#production-report-modal .btn-outline {
    color: currentColor !important;
}

#production-report-modal .btn-primary {
    color: white !important;
}

#production-report-modal .btn-outline {
    color: var(--text-primary, #111827) !important;
}

#production-report-modal .btn-outline:hover {
    color: white !important;
}
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
