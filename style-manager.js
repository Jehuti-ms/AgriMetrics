/**
 * StyleManager - Extended Version
 * Handles theme variables, header gradients, global styles, and per-module overrides
 */

const StyleManager = {
  currentTheme: 'modern-green',

  // Themes
  themes: {
    'modern-green': {
      name: 'Modern Green PWA',
      variables: {
        '--primary-500': '#22c55e',
        '--primary-600': '#16a34a',
        '--primary-700': '#15803d',
        '--gradient-primary': 'linear-gradient(135deg, #22c55e, #16a34a)',
        '--gradient-primary-hover': 'linear-gradient(135deg, #16a34a, #15803d)',
        '--module-bg': 'linear-gradient(135deg, #f8faf9 0%, #f0f7f4 100%)',
        '--card-bg': 'rgba(255, 255, 255, 0.95)',
        '--card-bg-hover': 'rgba(255, 255, 255, 1)',
        '--card-border': 'rgba(255, 255, 255, 0.8)',
        '--shadow-md': '0 4px 20px rgba(0, 0, 0, 0.1)',
        '--radius-xl': '20px',
        '--text-primary': '#0f172a'
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
        '--card-border': 'rgba(255, 255, 255, 0.1)',
        '--text-primary': '#e5e7eb'
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
    '.btn-sm': {
      padding: '8px 16px',
      fontSize: '14px',
      borderRadius: '8px'
    },
    '.glass-card': {
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-md)',
      padding: '24px'
    },
    '.btn-outline': {
      border: '1px solid var(--primary-500)',
      background: 'transparent',
      color: 'var(--primary-600)',
      padding: '8px 16px',
      borderRadius: '8px'
    }
  },

  moduleStyles: {},

  // Init
  init() {
    console.log('🎨 Initializing StyleManager...');
    this.applyTheme(this.currentTheme);
    this.injectStyles(this.globalStyles);
    Object.entries(this.moduleStyles).forEach(([moduleId, styles]) => {
      this.injectScopedStyles(moduleId, styles);
    });
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
      console.log(`✅ StyleManager: Registered ${config.name}`);
    }
  },

  addGlobalStyles(styles) {
    Object.assign(this.globalStyles, styles);
    this.injectStyles(styles);
  },

  StyleManager.addModuleStyles('sales-record', {
  '.sales-summary': {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    margin: '2rem 0'
  },
  '.summary-card': {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    padding: '1.75rem',
    transition: 'all 0.3s ease'
  },
  '.summary-card:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  }
});


  injectStyles(styles) {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-style-manager', 'global');
    styleTag.innerHTML = Object.entries(styles).map(([selector, rules]) => {
      const ruleText = Object.entries(rules).map(([k, v]) => `${k}: ${v};`).join(' ');
      return `${selector} { ${ruleText} }`;
    }).join('\n');
    document.head.appendChild(styleTag);
  },

  injectScopedStyles(moduleId, styles) {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-style-manager', moduleId);
    styleTag.innerHTML = Object.entries(styles).map(([selector, rules]) => {
      const ruleText = Object.entries(rules).map(([k, v]) => `${k}: ${v};`).join(' ');
      return `#${moduleId} ${selector} { ${ruleText} }`;
    }).join('\n');
    document.head.appendChild(styleTag);
  }
};

// Expose globally
window.StyleManager = StyleManager;
console.log('✅ Extended StyleManager loaded');
