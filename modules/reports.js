// modules/reports.js - COMPLETE FIXED VERSION
console.log('Loading reports module...');

const ReportsModule = {
    name: 'reports',
    id: 'reports',
    initialized: false,
    element: null,

    initialize() {
        console.log('📈 Initializing Reports with StyleManager...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Register with StyleManager
        if (window.StyleManager && window.StyleManager.registerModule) {
            window.StyleManager.registerModule(this.name, this.element, this);
        }

        this.renderReports();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Reports initialized with StyleManager');
        return true;
    },

    // StyleManager integration methods
    onThemeChange(theme) {
        console.log(`Reports updating for theme: ${theme}`);
        this.applyThemeStyles();
    },

    onStyleUpdate(styles) {
        console.log('Reports styles updated:', styles);
        this.applyThemeStyles();
    },

    applyThemeStyles() {
        if (!this.element || !window.StyleManager) return;
        
        // Get current theme from StyleManager
        const theme = window.StyleManager.currentTheme || 'light';
        
        // Get module styles if available
        const styles = window.StyleManager.getModuleStyles ? 
                      window.StyleManager.getModuleStyles(this.name) : null;
        
        // Apply background styles
        this.element.style.backgroundColor = styles?.backgroundColor || 
            (theme === 'dark' ? '#1a1a1a' : '#f5f5f5');
        
        // Apply module-specific styles
        this.applyModuleStyles(theme, styles);
    },

    applyModuleStyles(theme, styles) {
        // Apply styles to reports elements
        const sectionTitles = this.element.querySelectorAll('.section-title');
        sectionTitles.forEach(el => {
            const textColor = styles?.textColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
            el.style.color = textColor;
        });

        // Apply to charts and report sections
        const containers = this.element.querySelectorAll('.chart-container, .report-section, .report-card');
        containers.forEach(container => {
            container.style.backgroundColor = styles?.cardBackground || 
                (theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            container.style.borderColor = styles?.borderColor || 
                (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        });

        // Apply to text elements
        const textElements = this.element.querySelectorAll('.report-text, .chart-description');
        textElements.forEach(el => {
            const textColor = theme === 'dark' ? '#a0a0a0' : '#666666';
            el.style.color = textColor;
        });
    },

    setupEventListeners() {
        // Add event listeners for report actions
        const refreshButtons = this.element.querySelectorAll('.refresh-report-btn');
        refreshButtons.forEach(btn => {
            btn.addEventListener('click', () => this.refreshReports());
        });
    },

    renderReports() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="reports" class="module-container">
                <div class="reports-header">
                    <h1 class="welcome-header">Reports & Analytics</h1>
                    <p class="welcome-subtitle">Analyze your farm performance</p>
                </div>

                <div class="reports-content">
                    <div class="report-section">
                        <h2 class="section-title">Farm Overview</h2>
                        <div class="chart-container">
                            <div class="chart-placeholder">
                                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                                <div style="font-size: 16px; margin-bottom: 8px;">Reports Dashboard</div>
                                <div style="font-size: 14px; color: #666;">Farm analytics and insights will appear here</div>
                            </div>
                        </div>
                    </div>

                    <div class="reports-grid">
                        <div class="report-card">
                            <div class="report-icon">💰</div>
                            <div class="report-title">Revenue Reports</div>
                            <div class="report-description">Income analysis and trends</div>
                            <button class="view-report-btn" data-report="revenue">View Report</button>
                        </div>

                        <div class="report-card">
                            <div class="report-icon">💸</div>
                            <div class="report-title">Expense Reports</div>
                            <div class="report-description">Cost breakdown and analysis</div>
                            <button class="view-report-btn" data-report="expenses">View Report</button>
                        </div>

                        <div class="report-card">
                            <div class="report-icon">📦</div>
                            <div class="report-title">Inventory Reports</div>
                            <div class="report-description">Stock levels and movement</div>
                            <button class="view-report-btn" data-report="inventory">View Report</button>
                        </div>

                        <div class="report-card">
                            <div class="report-icon">🐔</div>
                            <div class="report-title">Production Reports</div>
                            <div class="report-description">Yield and efficiency metrics</div>
                            <button class="view-report-btn" data-report="production">View Report</button>
                        </div>
                    </div>

                    <div class="refresh-section">
                        <button class="refresh-report-btn">
                            🔄 Refresh All Reports
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.applyLayoutStyles();
        this.applyThemeStyles();
        this.setupEventListeners();
    },

    applyLayoutStyles() {
        const container = this.element.querySelector('#reports');
        if (container) {
            container.style.padding = '20px';
            container.style.maxWidth = '1200px';
            container.style.margin = '0 auto';
        }

        const reportsHeader = this.element.querySelector('.reports-header');
        if (reportsHeader) {
            reportsHeader.style.marginBottom = '30px';
        }

        const welcomeHeader = this.element.querySelector('.welcome-header');
        if (welcomeHeader) {
            welcomeHeader.style.fontSize = '28px';
            welcomeHeader.style.marginBottom = '8px';
            welcomeHeader.style.fontWeight = '600';
            welcomeHeader.style.color = '#ffffff'; // Force white as requested
        }

        const welcomeSubtitle = this.element.querySelector('.welcome-subtitle');
        if (welcomeSubtitle) {
            welcomeSubtitle.style.fontSize = '16px';
        }

        const sectionTitles = this.element.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.style.fontSize = '20px';
            title.style.marginBottom = '20px';
            title.style.fontWeight = '600';
        });

        const reportsGrid = this.element.querySelector('.reports-grid');
        if (reportsGrid) {
            reportsGrid.style.display = 'grid';
            reportsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            reportsGrid.style.gap = '20px';
            reportsGrid.style.marginBottom = '30px';
        }

        const reportCards = this.element.querySelectorAll('.report-card');
        reportCards.forEach(card => {
            card.style.borderRadius = '16px';
            card.style.padding = '20px';
            card.style.textAlign = 'center';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.gap = '12px';
            card.style.backdropFilter = 'blur(20px)';
            card.style.WebkitBackdropFilter = 'blur(20px)';
        });

        const reportIcons = this.element.querySelectorAll('.report-icon');
        reportIcons.forEach(icon => {
            icon.style.fontSize = '32px';
        });

        const reportTitles = this.element.querySelectorAll('.report-title');
        reportTitles.forEach(title => {
            title.style.fontSize = '16px';
            title.style.fontWeight = '600';
        });

        const reportDescriptions = this.element.querySelectorAll('.report-description');
        reportDescriptions.forEach(desc => {
            desc.style.fontSize = '14px';
        });

        const viewButtons = this.element.querySelectorAll('.view-report-btn');
        viewButtons.forEach(btn => {
            btn.style.padding = '8px 16px';
            btn.style.borderRadius = '8px';
            btn.style.border = '1px solid';
            btn.style.backgroundColor = 'transparent';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '14px';
            btn.style.marginTop = '8px';
        });

        const chartContainer = this.element.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.style.borderRadius = '16px';
            chartContainer.style.padding = '20px';
            chartContainer.style.marginBottom = '30px';
            chartContainer.style.minHeight = '300px';
            chartContainer.style.display = 'flex';
            chartContainer.style.alignItems = 'center';
            chartContainer.style.justifyContent = 'center';
            chartContainer.style.backdropFilter = 'blur(20px)';
            chartContainer.style.WebkitBackdropFilter = 'blur(20px)';
        }

        const chartPlaceholder = this.element.querySelector('.chart-placeholder');
        if (chartPlaceholder) {
            chartPlaceholder.style.textAlign = 'center';
        }

        const refreshBtn = this.element.querySelector('.refresh-report-btn');
        if (refreshBtn) {
            refreshBtn.style.padding = '12px 24px';
            refreshBtn.style.borderRadius = '12px';
            refreshBtn.style.border = '1px solid';
            refreshBtn.style.backgroundColor = 'transparent';
            refreshBtn.style.cursor = 'pointer';
            refreshBtn.style.fontSize = '14px';
        }

        const refreshSection = this.element.querySelector('.refresh-section');
        if (refreshSection) {
            refreshSection.style.textAlign = 'center';
            refreshSection.style.marginTop = '30px';
        }
    },

    refreshReports() {
        console.log('Refreshing reports...');
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Reports refreshed!', 'success');
        }
        // Add actual refresh logic here
    },

    viewReport(reportType) {
        console.log(`Viewing ${reportType} report`);
        // Add report viewing logic here
    }
};

// Register the module
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered');
}

// Export for global access
window.ReportsModule = ReportsModule;
