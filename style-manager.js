// Add this method to your StyleManager object (add it before the init() method):

/**
 * Fix navigation brand text colors (MISSING METHOD)
 */
fixNavigationColors() {
    // Fix for "AgriMetrics" and "Farm Management System" text colors
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        const brandText = navBrand.querySelector('.brand-text');
        const brandSubtitle = navBrand.querySelector('.brand-subtitle');
        
        if (brandText && brandSubtitle) {
            // Apply the same color to both
            const textColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--text-secondary').trim() || '#666666';
            
            brandText.style.color = textColor;
            brandSubtitle.style.color = textColor;
            
            // In dark mode, use light gray
            if (document.body.classList.contains('dark-mode')) {
                const darkTextColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--dm-text-secondary').trim() || '#cbd5e1';
                
                brandText.style.color = darkTextColor;
                brandSubtitle.style.color = darkTextColor;
            }
        }
    }
},

/**
 * Fix all navigation button sizes and hover states (MISSING METHOD)
 */
fixNavigationButtons() {
    // Fix navigation button sizes
    const navItems = document.querySelector('.nav-items');
    if (navItems) {
        navItems.style.gap = '4px';
        navItems.style.padding = '0 4px';
    }
    
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
        btn.style.padding = '6px 8px';
        btn.style.minWidth = '60px';
        btn.style.maxWidth = '80px';
    });
    
    const navLabels = document.querySelectorAll('.nav-label');
    navLabels.forEach(label => {
        label.style.fontSize = '10px';
        label.style.marginTop = '2px';
    });
    
    // Fix dark mode hover states (use dark gray, not white)
    if (document.body.classList.contains('dark-mode')) {
        const style = document.createElement('style');
        style.id = 'dark-mode-hover-fix';
        style.textContent = `
            .dark-mode .nav-item:hover {
                background: rgba(71, 85, 105, 0.3) !important;
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
        `;
        document.head.appendChild(style);
    }
},

/**
 * Fix profile module buttons (MISSING METHOD)
 */
fixProfileButtons() {
    const profileModule = document.querySelector('.profile-module');
    if (profileModule) {
        const actionButtons = profileModule.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'row';
            actionButtons.style.gap = '10px';
            actionButtons.style.flexWrap = 'wrap';
        }
        
        const profileBtns = profileModule.querySelectorAll('.btn-primary, .btn-outline');
        profileBtns.forEach(btn => {
            btn.style.width = 'auto';
            btn.style.minWidth = '120px';
            btn.style.maxWidth = '200px';
            btn.style.flex = '0 1 auto';
        });
    }
},

/**
 * Fix recent activity text size (MISSING METHOD)
 */
fixRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const emptyState = activityList.querySelector('div');
        if (emptyState) {
            const icon = emptyState.querySelector('div:first-child');
            const title = emptyState.querySelector('div:nth-child(2)');
            const subtitle = emptyState.querySelector('div:last-child');
            
            if (icon) {
                icon.style.fontSize = '28px';
                icon.style.marginBottom = '8px';
            }
            if (title) {
                title.style.fontSize = '13px';
                title.style.marginBottom = '4px';
            }
            if (subtitle) {
                subtitle.style.fontSize = '11px';
            }
        }
    }
},

/**
 * Fix welcome section text color (MISSING METHOD)
 */
fixWelcomeSection() {
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        // Force white text
        welcomeSection.style.color = 'white';
        
        const welcomeTitle = welcomeSection.querySelector('h1');
        const welcomeText = welcomeSection.querySelector('p');
        
        if (welcomeTitle) {
            welcomeTitle.style.color = 'white';
            welcomeTitle.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
        }
        if (welcomeText) {
            welcomeText.style.color = 'white';
            welcomeText.style.opacity = '0.9';
        }
        
        // Ensure it stays white in dark mode too
        if (document.body.classList.contains('dark-mode')) {
            const style = document.createElement('style');
            style.id = 'welcome-text-fix';
            style.textContent = `
                .welcome-section, .welcome-section * {
                    color: white !important;
                }
                .welcome-section h1, .welcome-section p {
                    color: white !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
},

/**
 * Apply all CSS fixes (NEW METHOD)
 */
applyAllFixes() {
    console.log('🔧 Applying all StyleManager fixes...');
    
    this.fixNavigationColors();
    this.fixNavigationButtons();
    this.fixProfileButtons();
    this.fixRecentActivity();
    this.fixWelcomeSection();
    
    console.log('✅ All StyleManager fixes applied');
},
