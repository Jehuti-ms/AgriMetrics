/**
 * StyleManager - Minimal Version
 * Handles theme variables and header gradients only
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

  // Module configs (only header gradients now)
  moduleConfigs: {
    'dashboard':         { name: 'Dashboard', headerGradient: 'var(--gradient-primary)' },
    'income-expenses':   { name: 'Income & Expenses', headerGradient: 'var(--gradient-primary)' },
    'inventory-check':   { name: 'Inventory Management', headerGradient: 'var(--gradient-primary)' },
    'orders':            { name: 'Orders Management', headerGradient: 'var(--gradient-primary)' },
    'sales-record':      { name: 'Sales Records', headerGradient: 'var(--gradient-primary)' },
    'production':        { name: 'Production Tracking', headerGradient: 'var(--gradient-production)' },
    'feed-record':       { name: 'Feed Management', headerGradient: 'var(--gradient-primary)' },
    'broiler-mortality': { name: 'Broiler Mortality', headerGradient: 'var(--gradient-mortality)' },
    'reports':           { name: 'Reports & Analytics', headerGradient: 'var(--gradient-primary)' },
    'profile':           { name: 'Profile', headerGradient: 'var(--gradient-primary)' }
  },

  // Init
  init() {
    console.log('🎨 Initializing minimal StyleManager...');
    this.applyTheme(this.currentTheme);
    console.log('✅ StyleManager ready');
  },

  // Apply theme
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

  // Register module (only applies header gradient)
  registerModule(moduleId, element) {
    const config = this.moduleConfigs[moduleId];
    if (config && element) {
      element.classList.add('module-container');
      element.style.setProperty('--header-gradient', config.headerGradient);
      console.log(`✅ StyleManager: Registered ${config.name}`);
    }
  }
};

// Expose globally
window.StyleManager = StyleManager;
console.log('✅ Minimal StyleManager loaded');
