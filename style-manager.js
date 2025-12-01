/**
 * StyleManager - Extended Version with Modern PWA Styling
 * Handles theme variables, header gradients, global styles, and per-module overrides
 */

const StyleManager = {
  currentTheme: 'modern-green',

  // Themes
  themes: {
    'modern-green': {
      name: 'Modern Green PWA',
      variables: {
        // Primary Colors
        '--primary-500': '#22c55e',
        '--primary-600': '#16a34a',
        '--primary-700': '#15803d',
        '--primary-100': '#dcfce7',
        '--primary-50': '#f0fdf4',
        
        // Gradients
        '--gradient-primary': 'linear-gradient(135deg, #22c55e, #16a34a)',
        '--gradient-primary-hover': 'linear-gradient(135deg, #16a34a, #15803d)',
        '--gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,247,244,0.95) 100%)',
        '--gradient-sidebar': 'linear-gradient(180deg, #f8faf9 0%, #f0f7f4 100%)',
        
        // Backgrounds
        '--module-bg': 'linear-gradient(135deg, #f8faf9 0%, #f0f7f4 100%)',
        '--card-bg': 'rgba(255, 255, 255, 0.95)',
        '--card-bg-hover': 'rgba(255, 255, 255, 1)',
        '--sidebar-bg': 'rgba(248, 250, 249, 0.95)',
        '--modal-bg': 'rgba(255, 255, 255, 0.98)',
        
        // Borders & Shadows
        '--card-border': 'rgba(34, 197, 94, 0.1)',
        '--card-border-hover': 'rgba(34, 197, 94, 0.2)',
        '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
        '--shadow-md': '0 4px 20px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
        '--shadow-xl': '0 12px 48px rgba(0, 0, 0, 0.15)',
        
        // Borders Radius
        '--radius-sm': '8px',
        '--radius-md': '12px',
        '--radius-lg': '16px',
        '--radius-xl': '20px',
        '--radius-2xl': '24px',
        
        // Text Colors
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--text-muted': '#94a3b8',
        '--text-light': '#f8fafc',
        
        // Status Colors
        '--status-paid': '#22c55e',
        '--status-pending': '#f59e0b',
        '--status-cancelled': '#ef4444',
        '--status-overdue': '#dc2626',
        
        // Spacing
        '--spacing-xs': '4px',
        '--spacing-sm': '8px',
        '--spacing-md': '16px',
        '--spacing-lg': '24px',
        '--spacing-xl': '32px',
        '--spacing-2xl': '48px'
      }
    },
    'dark-mode': {
      name: 'Dark Green',
      variables: {
        // Primary Colors
        '--primary-500': '#4ade80',
        '--primary-600': '#22c55e',
        '--primary-700': '#16a34a',
        '--primary-100': '#166534',
        '--primary-50': '#052e16',
        
        // Gradients
        '--gradient-primary': 'linear-gradient(135deg, #4ade80, #22c55e)',
        '--gradient-primary-hover': 'linear-gradient(135deg, #22c55e, #16a34a)',
        '--gradient-card': 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        '--gradient-sidebar': 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        
        // Backgrounds
        '--module-bg': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        '--card-bg': 'rgba(30, 41, 59, 0.95)',
        '--card-bg-hover': 'rgba(30, 41, 59, 1)',
        '--sidebar-bg': 'rgba(15, 23, 42, 0.95)',
        '--modal-bg': 'rgba(15, 23, 42, 0.98)',
        
        // Borders & Shadows
        '--card-border': 'rgba(74, 222, 128, 0.1)',
        '--card-border-hover': 'rgba(74, 222, 128, 0.2)',
        '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.2)',
        '--shadow-md': '0 4px 20px rgba(0, 0, 0, 0.25)',
        '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.3)',
        '--shadow-xl': '0 12px 48px rgba(0, 0, 0, 0.35)',
        
        // Text Colors
        '--text-primary': '#e5e7eb',
        '--text-secondary': '#cbd5e1',
        '--text-muted': '#94a3b8',
        '--text-light': '#f8fafc',
        
        // Status Colors (same in dark mode)
        '--status-paid': '#4ade80',
        '--status-pending': '#fbbf24',
        '--status-cancelled': '#f87171',
        '--status-overdue': '#dc2626'
      }
    }
  },

  // Module configs (header gradients only)
  moduleConfigs: {
    'dashboard':         { name: 'Dashboard', headerGradient: 'var(--gradient-primary)' },
    'income-expenses':   { name: 'Income & Expenses', headerGradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    'inventory-check':   { name: 'Inventory Management', headerGradient: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
    'orders':            { name: 'Orders Management', headerGradient: 'linear-gradient(135deg, #f97316, #c2410c)' },
    'sales-record':      { name: 'Sales Records', headerGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
    'production':        { name: 'Production Tracking', headerGradient: 'linear-gradient(135deg, #10b981, #059669)' },
    'feed-record':       { name: 'Feed Management', headerGradient: 'linear-gradient(135deg, #0ea5e9, #0369a1)' },
    'broiler-mortality': { name: 'Broiler Mortality', headerGradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    'reports':           { name: 'Reports & Analytics', headerGradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
    'profile':           { name: 'Profile', headerGradient: 'var(--gradient-primary)' }
  },

  // Global styles
  globalStyles: {
    // Base reset
    '*': {
      margin: '0',
      padding: '0',
      boxSizing: 'border-box'
    },
    
    // Body
    'body': {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
      fontSize: '14px',
      lineHeight: '1.5',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--module-bg)',
      minHeight: '100vh'
    },
    
    // Button styles
    '.btn': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      fontFamily: 'inherit'
    },
    
    '.btn-primary': {
      background: 'var(--gradient-primary)',
      color: 'white',
      boxShadow: 'var(--shadow-sm)'
    },
    
    '.btn-primary:hover': {
      background: 'var(--gradient-primary-hover)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-md)'
    },
    
    '.btn-outline': {
      background: 'transparent',
      color: 'var(--primary-600)',
      border: '2px solid var(--primary-500)'
    },
    
    '.btn-outline:hover': {
      background: 'var(--primary-50)',
      transform: 'translateY(-1px)'
    },
    
    '.btn-text': {
      background: 'transparent',
      color: 'var(--text-secondary)',
      padding: '8px 12px'
    },
    
    '.btn-text:hover': {
      color: 'var(--primary-600)',
      background: 'var(--primary-50)'
    },
    
    '.btn-block': {
      width: '100%'
    },
    
    '.btn-icon': {
      gap: '6px',
      padding: '8px 16px'
    },
    
    '.btn-icon-text': {
      fontSize: '16px'
    },
    
    '.btn-sm': {
      padding: '6px 12px',
      fontSize: '13px'
    },
    
    // Form elements
    'input, select, textarea': {
      fontFamily: 'inherit',
      fontSize: '14px',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--text-muted)',
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      transition: 'all 0.2s ease'
    },
    
    'input:focus, select:focus, textarea:focus': {
      outline: 'none',
      borderColor: 'var(--primary-500)',
      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)'
    },
    
    'select': {
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '40px'
    },
    
    'textarea': {
      resize: 'vertical',
      minHeight: '80px'
    },
    
    'label': {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '4px',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    '.form-group': {
      marginBottom: '16px'
    },
    
    '.form-row': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    
    // Glass card effect
    '.glass-card': {
      background: 'var(--card-bg)',
      backdropFilter: 'blur(10px)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--shadow-md)',
      transition: 'all 0.3s ease'
    },
    
    '.glass-card:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-lg)',
      borderColor: 'var(--card-border-hover)'
    },
    
    // Utility classes
    '.text-muted': {
      color: 'var(--text-muted)'
    },
    
    '.hidden': {
      display: 'none !important'
    },
    
    '.empty-state': {
      textAlign: 'center',
      padding: '48px 24px'
    },
    
    '.empty-content': {
      maxWidth: '300px',
      margin: '0 auto'
    },
    
    '.empty-icon': {
      fontSize: '48px',
      display: 'block',
      marginBottom: '16px',
      opacity: '0.5'
    }
  },

  // Module-specific styles
  moduleStyles: {
    'sales-record': {
      // Module container
      '.module-container': {
        padding: '24px',
        minHeight: '100vh',
        background: 'var(--module-bg)'
      },
      
      // Header styles
      '.module-header': {
        background: 'var(--header-gradient)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      },
      
      '.module-header::before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
      },
      
      '.header-content': {
        position: 'relative',
        zIndex: '1',
        marginBottom: '20px'
      },
      
      '.header-text': {
        marginBottom: '16px'
      },
      
      '.module-title': {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '8px',
        letterSpacing: '-0.5px'
      },
      
      '.module-subtitle': {
        fontSize: '15px',
        opacity: '0.9',
        fontWeight: '400'
      },
      
      '.header-stats': {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      },
      
      '.stat-badge': {
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '120px'
      },
      
      '.stat-icon': {
        fontSize: '20px',
        marginBottom: '4px'
      },
      
      '.stat-value': {
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '2px'
      },
      
      '.stat-label': {
        fontSize: '12px',
        opacity: '0.8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      
      '.header-actions': {
        position: 'relative',
        zIndex: '1',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      },
      
      // Summary cards
      '.sales-summary': {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      },
      
      '.summary-card': {
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      },
      
      '.summary-icon': {
        fontSize: '36px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 'var(--radius-lg)',
        flexShrink: '0'
      },
      
      '.summary-content': {
        flex: '1'
      },
      
      '.summary-content h3': {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      
      '.summary-value': {
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '4px',
        lineHeight: '1.2'
      },
      
      '.summary-period': {
        fontSize: '12px',
        color: 'var(--text-muted)'
      },
      
      '.summary-trend': {
        textAlign: 'right',
        flexShrink: '0'
      },
      
      '.trend-indicator': {
        fontSize: '14px',
        fontWeight: '600'
      },
      
      '.trend-indicator.up': {
        color: 'var(--status-paid)'
      },
      
      '.trend-indicator.down': {
        color: 'var(--status-cancelled)'
      },
      
      '.trend-value': {
        display: 'block',
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginTop: '2px'
      },
      
      // Content layout
      '.module-content': {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '32px'
      },
      
      '.content-sidebar': {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      },
      
      '.sidebar-card': {
        padding: '24px'
      },
      
      '.sidebar-title': {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '20px',
        color: 'var(--text-primary)'
      },
      
      '.filter-section': {
        marginBottom: '16px'
      },
      
      '.filter-select': {
        width: '100%',
        padding: '10px 12px'
      },
      
      '.quick-form': {
        marginTop: '16px'
      },
      
      '.content-main': {
        minWidth: '0' // Prevent grid overflow
      },
      
      '.main-card': {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      },
      
      '.card-header': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--card-border)'
      },
      
      '.card-title': {
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--text-primary)'
      },
      
      '.card-actions': {
        display: 'flex',
        gap: '8px'
      },
      
      // Table styles
      '.table-container': {
        flex: '1',
        overflowX: 'auto',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--card-border)'
      },
      
      '.data-table': {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
      },
      
      '.data-table thead': {
        background: 'var(--primary-50)'
      },
      
      '.data-table th': {
        padding: '16px 20px',
        textAlign: 'left',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--card-border)',
        whiteSpace: 'nowrap'
      },
      
      '.data-table td': {
        padding: '16px 20px',
        borderBottom: '1px solid var(--card-border)',
        verticalAlign: 'middle'
      },
      
      '.data-table tbody tr:hover': {
        background: 'var(--primary-50)'
      },
      
      '.data-table tbody tr:last-child td': {
        borderBottom: 'none'
      },
      
      '.date-cell': {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      },
      
      '.date-day': {
        fontWeight: '500'
      },
      
      '.date-time': {
        fontSize: '12px',
        color: 'var(--text-muted)'
      },
      
      '.product-cell': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      
      '.product-name': {
        fontWeight: '500'
      },
      
      '.product-notes': {
        color: 'var(--text-muted)',
        cursor: 'help'
      },
      
      '.status-badge': {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      
      '.status-paid': {
        background: 'rgba(34, 197, 94, 0.1)',
        color: 'var(--status-paid)'
      },
      
      '.status-pending': {
        background: 'rgba(245, 158, 11, 0.1)',
        color: 'var(--status-pending)'
      },
      
      '.status-cancelled': {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--status-cancelled)'
      },
      
      '.actions-cell': {
        whiteSpace: 'nowrap'
      },
      
      '.action-buttons': {
        display: 'flex',
        gap: '8px'
      },
      
      '.btn-icon': {
        width: '32px',
        height: '32px',
        padding: '0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      
      '.btn-icon:hover': {
        background: 'var(--primary-50)',
        transform: 'scale(1.1)'
      },
      
      '.btn-icon.edit-sale:hover': {
        color: 'var(--primary-600)'
      },
      
      '.btn-icon.delete-sale:hover': {
        color: 'var(--status-cancelled)'
      },
      
      // Table footer
      '.table-footer': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid var(--card-border)'
      },
      
      '.table-summary': {
        fontSize: '14px',
        color: 'var(--text-muted)'
      },
      
      '.pagination': {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      },
      
      '.page-info': {
        fontSize: '14px',
        color: 'var(--text-secondary)'
      },
      
      // Modal styles
      '.modal': {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '20px'
      },
      
      '.modal.hidden': {
        display: 'none'
      },
      
      '.modal-content': {
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      },
      
      '.modal-header': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--card-border)'
      },
      
      '.modal-header h3': {
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text-primary)'
      },
      
      '.modal-body': {
        marginBottom: '24px'
      },
      
      '.modal-footer': {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid var(--card-border)'
      },
      
      // Responsive styles
      '@media (max-width: 1200px)': {
        '.module-content': {
          gridTemplateColumns: '1fr'
        },
        
        '.content-sidebar': {
          order: '2'
        },
        
        '.content-main': {
          order: '1'
        }
      },
      
      '@media (max-width: 768px)': {
        '.module-header': {
          padding: '20px'
        },
        
        '.header-stats': {
          flexDirection: 'column'
        },
        
        '.stat-badge': {
          minWidth: 'auto',
          width: '100%'
        },
        
        '.header-actions': {
          flexDirection: 'column'
        },
        
        '.sales-summary': {
          gridTemplateColumns: '1fr'
        },
        
        '.summary-card': {
          flexDirection: 'column',
          textAlign: 'center',
          gap: '16px'
        },
        
        '.summary-trend': {
          textAlign: 'center'
        },
        
        '.form-row': {
          gridTemplateColumns: '1fr',
          gap: '12px'
        },
        
        '.card-header': {
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'stretch'
        },
        
        '.card-actions': {
          justifyContent: 'center'
        },
        
        '.table-footer': {
          flexDirection: 'column',
          gap: '16px',
          textAlign: 'center'
        }
      },
      
      '@media (max-width: 480px)': {
        '.module-container': {
          padding: '16px'
        },
        
        '.data-table th, .data-table td': {
          padding: '12px 16px'
        },
        
        '.modal-content': {
          padding: '20px'
        }
      }
    }
  },

  // Init
  init() {
    console.log('🎨 Initializing StyleManager...');
    this.applyTheme(this.currentTheme);
    this.injectStyles(this.globalStyles);
    this.injectModuleStyles();
    console.log('✅ StyleManager ready');
  },

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) {
      console.warn(`Theme "${themeName}" not found`);
      return;
    }
    this.currentTheme = themeName;
    const root = document.documentElement;
    Object.entries(theme.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    console.log(`🎨 Applied ${theme.name}`);
  },

  registerModule(moduleId, element) {
    const config = this.moduleConfigs[moduleId];
    if (config && element) {
      element.classList.add('module-container');
      element.style.setProperty('--header-gradient', config.headerGradient);
      
      // Inject module-specific styles if not already injected
      if (this.moduleStyles[moduleId] && !document.querySelector(`style[data-module="${moduleId}"]`)) {
        this.injectScopedStyles(moduleId, this.moduleStyles[moduleId]);
      }
      
      console.log(`✅ StyleManager: Registered ${config.name}`);
    }
  },

  addGlobalStyles(styles) {
    Object.assign(this.globalStyles, styles);
    this.injectStyles(styles);
  },

  addModuleStyles(moduleId, styles) {
    if (!this.moduleStyles[moduleId]) {
      this.moduleStyles[moduleId] = {};
    }
    Object.assign(this.moduleStyles[moduleId], styles);
    
    // If module is already rendered, inject styles immediately
    const moduleElement = document.getElementById(moduleId);
    if (moduleElement) {
      this.injectScopedStyles(moduleId, styles);
    }
  },

  injectStyles(styles) {
    // Remove existing global style tag
    const existingStyle = document.querySelector('style[data-style-manager="global"]');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-style-manager', 'global');
    
    let cssText = '';
    for (const [selector, rules] of Object.entries(styles)) {
      if (selector.startsWith('@')) {
        // Handle media queries and other at-rules
        cssText += `${selector} {\n`;
        for (const [nestedSelector, nestedRules] of Object.entries(rules)) {
          const ruleText = Object.entries(nestedRules).map(([k, v]) => `${k}: ${v};`).join(' ');
          cssText += `  ${nestedSelector} { ${ruleText} }\n`;
        }
        cssText += '}\n';
      } else {
        const ruleText = Object.entries(rules).map(([k, v]) => `${k}: ${v};`).join(' ');
        cssText += `${selector} { ${ruleText} }\n`;
      }
    }
    
    styleTag.textContent = cssText;
    document.head.appendChild(styleTag);
  },

  injectModuleStyles() {
    // Remove existing module styles
    document.querySelectorAll('style[data-module]').forEach(style => style.remove());
    
    // Inject all module styles
    Object.entries(this.moduleStyles).forEach(([moduleId, styles]) => {
      this.injectScopedStyles(moduleId, styles);
    });
  },

  injectScopedStyles(moduleId, styles) {
    // Remove existing styles for this module
    const existingStyle = document.querySelector(`style[data-module="${moduleId}"]`);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-module', moduleId);
    
    let cssText = '';
    for (const [selector, rules] of Object.entries(styles)) {
      if (selector.startsWith('@')) {
        // Handle media queries
        cssText += `${selector} {\n`;
        for (const [nestedSelector, nestedRules] of Object.entries(rules)) {
          const ruleText = Object.entries(nestedRules).map(([k, v]) => `${k}: ${v};`).join(' ');
          cssText += `  #${moduleId} ${nestedSelector} { ${ruleText} }\n`;
        }
        cssText += '}\n';
      } else {
        const ruleText = Object.entries(rules).map(([k, v]) => `${k}: ${v};`).join(' ');
        cssText += `#${moduleId} ${selector} { ${ruleText} }\n`;
      }
    }
    
    styleTag.textContent = cssText;
    document.head.appendChild(styleTag);
  },

  // Utility method to toggle theme
  toggleTheme() {
    const newTheme = this.currentTheme === 'modern-green' ? 'dark-mode' : 'modern-green';
    this.applyTheme(newTheme);
    return newTheme;
  },

  // Utility method to get module config
  getModuleConfig(moduleId) {
    return this.moduleConfigs[moduleId] || null;
  },

  // Utility method to update module gradient
  updateModuleGradient(moduleId, gradient) {
    const config = this.moduleConfigs[moduleId];
    if (config) {
      config.headerGradient = gradient;
      const moduleElement = document.getElementById(moduleId);
      if (moduleElement) {
        moduleElement.style.setProperty('--header-gradient', gradient);
      }
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StyleManager.init();
  });
} else {
  StyleManager.init();
}

// Expose globally
window.StyleManager = StyleManager;
console.log('✅ Extended StyleManager loaded');
