// ==================== MODULE-SPECIFIC STYLES ====================
moduleStyles: {
  // This empty object was causing the syntax error
  // It needs to be properly structured or removed
  
  // ==================== DASHBOARD MODULE ====================
  'dashboard': {
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
      padding: '12px 20px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      minWidth: '140px'
    },
    
    // Stat value - white text on green
    '.stat-value': {
      fontSize: '24px',
      fontWeight: '700',
      color: 'white',
      lineHeight: '1.2',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
    },
    
    // Stat label - light white text
    '.stat-label': {
      fontSize: '12px',
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
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
    
    // ======== CLEAN HEADER STATS (NO BOXES) ========
    '.header-stats': {
      display: 'flex',
      gap: '32px',
      flexWrap: 'nowrap',
      alignItems: 'center'
    },
    
    // Clean stat badges - NO boxes, just text
    '.stat-badge': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '4px'
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
    '.financial-summary': {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      margin: '24px 0'
    },
    
    '.summary-card': {
      padding: '20px',
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.3s ease'
    },
    
    '.summary-card:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
    },
    
    '.summary-icon': {
      fontSize: '32px',
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--primary-50)',
      borderRadius: '12px'
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
    // ... existing sales-record styles (keep as is) ...
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
    
    // ... rest of sales-record styles ...
  }
  
  // You can add more modules here:
  // 'inventory-check': { ... },
  // 'orders': { ... },
  // 'production': { ... },
  // 'feed-record': { ... },
  // 'broiler-mortality': { ... },
  // 'reports': { ... },
  // 'profile': { ... }
},
