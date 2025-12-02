/**
 * StyleManager - Extended Version with Modern PWA Styling
 * Handles theme variables, header gradients, global styles, and per-module overrides
 */

const StyleManager = {
  currentTheme: 'modern-green',

  // ==================== THEMES ====================
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
        
        // Background Colors
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8faf9',
        '--bg-tertiary': '#f1f5f9',
        
        // Card Colors
        '--card-bg': '#ffffff',
        '--card-bg-hover': '#f8faf9',
        
        // Text Colors
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--text-tertiary': '#94a3b8',
        '--text-light': '#f8fafc',
        
        // Border Colors
        '--border-color': '#e2e8f0',
        '--border-color-dark': '#334155',
        
        // Dark Mode Card Colors
        '--card-bg-dark': '#1e293b',
        '--bg-secondary-dark': '#0f172a',
        
        // Status Colors (with RGB values for opacity)
        '--status-paid': '#22c55e',
        '--status-paid-rgb': '34, 197, 94',
        '--status-pending': '#f59e0b',
        '--status-pending-rgb': '245, 158, 11',
        '--status-cancelled': '#ef4444',
        '--status-cancelled-rgb': '239, 68, 68',
        '--status-overdue': '#dc2626',
        '--status-overdue-rgb': '220, 38, 38',
        
        // Gradients
        '--gradient-primary': 'linear-gradient(135deg, #22c55e, #16a34a)',
        '--gradient-primary-hover': 'linear-gradient(135deg, #16a34a, #15803d)',
        '--gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,247,244,0.95) 100%)',
        '--gradient-sidebar': 'linear-gradient(180deg, #f8faf9 0%, #f0f7f4 100%)',
        
        // Module Background
        '--module-bg': 'linear-gradient(135deg, #f8faf9 0%, #f0f7f4 100%)',
        '--card-border': 'rgba(34, 197, 94, 0.1)',
        '--card-border-hover': 'rgba(34, 197, 94, 0.2)',
        
        // Shadows
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
        
        // Background Colors
        '--bg-primary': '#0f172a',
        '--bg-secondary': '#1e293b',
        '--bg-tertiary': '#334155',
        
        // Card Colors
        '--card-bg': '#1e293b',
        '--card-bg-hover': '#334155',
        
        // Text Colors
        '--text-primary': '#e5e7eb',
        '--text-secondary': '#cbd5e1',
        '--text-tertiary': '#94a3b8',
        '--text-light': '#f8fafc',
        
        // Border Colors
        '--border-color': '#334155',
        '--border-color-dark': '#475569',
        
        // Dark Mode Card Colors
        '--card-bg-dark': '#1e293b',
        '--bg-secondary-dark': '#0f172a',
        
        // Status Colors (with RGB values for opacity)
        '--status-paid': '#4ade80',
        '--status-paid-rgb': '74, 222, 128',
        '--status-pending': '#fbbf24',
        '--status-pending-rgb': '251, 191, 36',
        '--status-cancelled': '#f87171',
        '--status-cancelled-rgb': '248, 113, 113',
        '--status-overdue': '#dc2626',
        '--status-overdue-rgb': '220, 38, 38',
        
        // Gradients
        '--gradient-primary': 'linear-gradient(135deg, #4ade80, #22c55e)',
        '--gradient-primary-hover': 'linear-gradient(135deg, #22c55e, #16a34a)',
        '--gradient-card': 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        '--gradient-sidebar': 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        
        // Module Background
        '--module-bg': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        '--card-border': 'rgba(74, 222, 128, 0.1)',
        '--card-border-hover': 'rgba(74, 222, 128, 0.2)',
        
        // Shadows
        '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.2)',
        '--shadow-md': '0 4px 20px rgba(0, 0, 0, 0.25)',
        '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.3)',
        '--shadow-xl': '0 12px 48px rgba(0, 0, 0, 0.35)'
      }
    }
  },

  // ==================== MODULE CONFIGS ====================
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

  // ==================== GLOBAL STYLES ====================
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
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
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
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
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
      color: 'var(--text-tertiary)'
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

  // ==================== MODULE-SPECIFIC STYLES ====================
  moduleStyles: {
    // ==================== DASHBOARD MODULE ====================
    'dashboard': {
      // Module container
      '.module-container': {
        padding: '0',
        margin: '0',
        minHeight: 'auto',
        wdith: '100%'
        
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
        letterSpacing: '-0.5px',
        color: 'white'
      },

      '.module-subtitle': {
        fontSize: '15px',
        fontWeight: '400',
        color: 'white',
        opacity: '1',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
      },

      // Activity board styling
      '.activity-board': {
        padding: '24px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        marginTop: '24px'
      },

      '.activity-title': {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        color: 'var(--text-primary)'
      },

      '.activity-empty': {
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-tertiary)'
      },

      '.activity-empty p': {
        fontSize: '14px',
        marginBottom: '12px'
      },

      '.refresh-button': {
        marginTop: '16px',
        display: 'inline-block',
        padding: '10px 20px',
        background: 'var(--gradient-primary)',
        color: 'white',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      },

      '.refresh-button:hover': {
        background: 'var(--gradient-primary-hover)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-md)'
      }
    },
    
    // ======== INCOME & EXPENSES MODULE ============
    'income-expenses': {
      // Module container
      '.module-container': {
        padding: '0',
        margin: '0',
        width: '100%'
      },
      
      // ======== HEADER STATS WITH GREEN BACKGROUND ========
      '.header-stats': {
        display: 'flex',
        gap: '32px',
        flexWrap: 'nowrap',
        alignItems: 'center'
      },
      
      // Stat badges with header green background
     '.stat-badge': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '0',
      background: 'transparent',
      backdropFilter: 'none',
      borderRadius: '0',
      minWidth: 'auto'
    },
      
      // Stat value - white text on green
      '.stat-value': {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
        lineHeight: '1.2',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
      },

      '.stat-badge': {
        all: 'unset',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '0 !important',
        background: 'transparent !important',
        borderRadius: '0 !important',
        minWidth: 'auto !important'
      },

      // Stat label - light white text
      '.stat-label': {
        fontSize: '12px',
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
      },

      '.header-stats .stat-value': {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white !important',
        lineHeight: '1.2',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
      },
      
      '.header-stats .stat-label': {
        fontSize: '12px',
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9) !important',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
      },

      '.header-stats::-webkit-scrollbar': {
        height: '4px'
      },
      
      '.header-stats::-webkit-scrollbar-track': {
        background: 'transparent'
      },
      
      '.header-stats::-webkit-scrollbar-thumb': {
        backgroundColor: 'var(--border-color)',
        borderRadius: '2px'
      },
      
         
      // Stat value - clean and prominent
      '.stat-value': {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        lineHeight: '1.2'
      },
      
      // Stat label - subtle but clear
      '.stat-label': {
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      
      // Stat value - LARGE, BOLD, VISIBLE
      '.stat-value': {
        fontSize: '22px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        display: 'block',
        lineHeight: '1.2',
        textShadow: '0 1px 2px rgba(0,0,0,0.05)'
      },
      
      // Stat label - CLEAR AND DISTINCT
      '.stat-label': {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        display: 'block',
        opacity: '0.9'
      },
      
      // ======== FINANCIAL SUMMARY CARDS ========
      // Horizontal on desktop, stacked on mobile
      '.financial-summary-wrapper': {
        display: 'flex',
        justifyContent: 'center',       // centers the inner row
        width: '100%',
        marginTop: '32px'
      },
      
      '.financial-summary': {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',       // centers the cards inside the row
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto'
      },
      
      '.summary-card': {
        flex: '0 0 auto',
        width: '220px',
        padding: '20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.3s ease'
      },
         
      '.summary-icon': {
        fontSize: '32px',
        width: 'auto',
        height: 'auto',
        background: 'transparent',
        borderRadius: '0',
        padding: '0',
        margin: '0'
      },

      
      '.summary-card:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
      },
           
      '.summary-content': {
        flex: '1'
      },
      
      '.summary-content h3': {
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        margin: '0 0 4px 0'
      },
      
      '.summary-value': {
        fontSize: '24px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: '4px 0'
      },
      
      '.summary-period': {
        fontSize: '12px',
        color: 'var(--text-tertiary)'
      },
      
      '.summary-trend': {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px'
      },
      
      '.trend-indicator.up': {
        color: 'var(--status-paid)'
      },
      
      '.trend-indicator.down': {
        color: 'var(--status-cancelled)'
      },
      
      // ======== MODULE CONTENT LAYOUT ========
      '.module-content': {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '24px',
        marginTop: '24px'
      },
      
      '.content-sidebar': {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      },
      
      '.sidebar-card': {
        padding: '20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px'
      },
      
      '.sidebar-title': {
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: 'var(--text-primary)'
      },
      
      // Quick transaction form fixes
      '.quick-form .form-group': {
        marginBottom: '16px'
      },
      
      '.quick-form label': {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        marginBottom: '6px'
      },
      
      '.quick-form input, .quick-form select': {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '14px'
      },
      
      '.quick-export-options': {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      },
      
      // Category chart placeholder
      '.category-chart': {
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        textAlign: 'center'
      },
      
      '.chart-placeholder': {
        color: 'var(--text-tertiary)'
      },
      
      '.chart-icon': {
        fontSize: '48px',
        opacity: '0.5',
        marginBottom: '12px'
      },
      
      // Main content area fixes
      '.main-card': {
        padding: '24px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px'
      },
      
      '.card-header': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      },
      
      '.card-title': {
        fontSize: '18px',
        fontWeight: '600',
        margin: '0',
        color: 'var(--text-primary)'
      },
      
      '.card-actions': {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      },
      
      '.export-info': {
        fontSize: '12px',
        color: 'var(--text-tertiary)'
      },
      
      // ======== FILTER BAR ========
      '.filter-bar': {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        marginBottom: '20px'
      },
      
      '.filter-group': {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: '150px',
        flex: '1'
      },
      
      '.filter-group label': {
        fontSize: '12px',
        fontWeight: '500',
        color: 'var(--text-secondary)'
      },
      
      '.filter-select': {
        padding: '8px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '14px'
      },
      
      // ======== TABLE STYLES ========
      '.table-container': {
        overflowX: 'auto',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      },
      
      '.data-table': {
        width: '100%',
        borderCollapse: 'collapse'
      },
      
      '.data-table th': {
        background: 'var(--bg-secondary)',
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border-color)'
      },
      
      '.data-table td': {
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '14px'
      },
      
      '.data-table tr:hover': {
        background: 'var(--bg-secondary)'
      },
      
      // Type badges in table
      '.type-badge': {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500'
      },
      
      '.type-income': {
        background: 'rgba(var(--status-paid-rgb), 0.1)',
        color: 'var(--status-paid)'
      },
      
      '.type-expense': {
        background: 'rgba(var(--status-cancelled-rgb), 0.1)',
        color: 'var(--status-cancelled)'
      },
      
      '.amount-income': {
        color: 'var(--status-paid)',
        fontWeight: '600'
      },
      
      '.amount-expense': {
        color: 'var(--status-cancelled)',
        fontWeight: '600'
      },
      
      // ======== EMPTY STATES ========
      '.empty-state': {
        textAlign: 'center',
        padding: '40px 20px'
      },
      
      '.empty-content': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      },
      
      '.empty-icon': {
        fontSize: '48px',
        opacity: '0.3'
      },
      
      // ======== TABLE FOOTER ========
      '.table-footer': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0 0 0',
        borderTop: '1px solid var(--border-color)',
        marginTop: '16px'
      },
      
      '.table-summary': {
        fontSize: '14px',
        color: 'var(--text-secondary)'
      },
      
      '.pagination': {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      },
      
      '.page-info': {
        fontSize: '14px',
        color: 'var(--text-secondary)'
      },
      
      // ======== MODALS ========
      '.modal-content': {
        maxWidth: '600px',
        width: '90%',
        margin: '40px auto'
      },
      
      '.modal-header': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)'
      },
      
      '.modal-body': {
        padding: '24px',
        maxHeight: '70vh',
        overflowY: 'auto'
      },
      
      '.form-row': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '16px'
      },
      
      // Export progress modal
      '.export-progress': {
        padding: '20px 0'
      },
      
      '.progress-bar': {
        height: '8px',
        background: 'var(--bg-secondary)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '12px'
      },
      
      '.progress-fill': {
        height: '100%',
        background: 'var(--primary-500)',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
      },
      
      '.progress-text': {
        fontSize: '14px',
        color: 'var(--text-primary)',
        marginBottom: '8px'
      },
      
      '.progress-details': {
        fontSize: '12px',
        color: 'var(--text-secondary)'
      },
      
      '.export-success': {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'rgba(var(--status-paid-rgb), 0.1)',
        borderRadius: '8px',
        marginTop: '12px'
      },
      
      // ======== RESPONSIVE BREAKPOINTS ========
      '@media (max-width: 1200px)': {
        '.financial-summary': {
          gridTemplateColumns: 'repeat(2, 1fr)'
        }
      },
      
      '@media (max-width: 1024px)': {
        '.module-content': {
          gridTemplateColumns: '1fr'
        }
      },
      
      '@media (max-width: 768px)': {
        '.financial-summary': {
          gridTemplateColumns: '1fr'
        },
        
        '.module-header': {
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'stretch'
        },
        
        '.header-content': {
          flexDirection: 'column',
          gap: '16px'
        },
        
        '.header-stats': {
          order: '2'
        },
        
        '.header-actions': {
          order: '1',
          flexWrap: 'wrap',
          justifyContent: 'center'
        },
        
        '.filter-bar': {
          flexDirection: 'column',
          alignItems: 'stretch'
        },
        
        '.filter-group': {
          minWidth: '100%'
        },
        
        '.table-footer': {
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'stretch'
        },
        
        '.table-summary': {
          textAlign: 'center'
        },
        
        '.pagination': {
          justifyContent: 'center'
        },
        
        '.form-row': {
          gridTemplateColumns: '1fr'
        }
      },
      
      // ======== DARK MODE ADJUSTMENTS ========
      '@media (prefers-color-scheme: dark)': {
        '.header-stats .stat-badge': {
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color-dark)'
        },
        
        '.stat-value': {
          color: 'var(--text-primary)',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        },
        
        '.stat-label': {
          color: 'var(--text-secondary)'
        }
      }
    },
    
    // ======== SALES RECORD MODULE ========
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
      }
    }
  },

  // ==================== INITIALIZATION ====================
  init() {
    console.log('🎨 Initializing StyleManager...');
    this.applyTheme(this.currentTheme);
    this.injectStyles(this.globalStyles);
    console.log('✅ StyleManager ready');
  },

  // ==================== THEME METHODS ====================
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

  toggleTheme() {
    const newTheme = this.currentTheme === 'modern-green' ? 'dark-mode' : 'modern-green';
    this.applyTheme(newTheme);
    return newTheme;
  },

  // ==================== MODULE REGISTRATION ====================
  registerModule(moduleId, element, moduleInstance) {
    const config = this.moduleConfigs[moduleId];
    if (config && element) {
      element.classList.add('module-container');
      element.style.setProperty('--header-gradient', config.headerGradient);
      
      // Apply module-specific styles
      if (this.moduleStyles[moduleId]) {
        this.applyModuleStyles(moduleId);
      }
      
      console.log(`✅ StyleManager: Registered ${config.name}`);
    }
  },

  getModuleConfig(moduleId) {
    return this.moduleConfigs[moduleId] || null;
  },

  updateModuleGradient(moduleId, gradient) {
    const config = this.moduleConfigs[moduleId];
    if (config) {
      config.headerGradient = gradient;
      const moduleElement = document.getElementById(moduleId);
      if (moduleElement) {
        moduleElement.style.setProperty('--header-gradient', gradient);
      }
    }
  },

  // ==================== STYLE INJECTION ====================
  addGlobalStyles(styles) {
    Object.assign(this.globalStyles, styles);
    this.injectStyles(styles);
  },

  addModuleStyles(moduleId, styles) {
    if (!this.moduleStyles[moduleId]) {
      this.moduleStyles[moduleId] = {};
    }
    Object.assign(this.moduleStyles[moduleId], styles);
    
    // If module is already rendered, apply styles immediately
    const moduleElement = document.getElementById(moduleId);
    if (moduleElement) {
      this.applyModuleStyles(moduleId);
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

  applyModuleStyles(moduleId) {
    const styles = this.moduleStyles[moduleId];
    if (!styles) return;
    
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

  // ==================== HELPER METHODS ====================
  getCurrentTheme() {
    return this.currentTheme;
  },

  getModuleStyles(moduleId) {
    return this.moduleStyles[moduleId] || null;
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
