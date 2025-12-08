// modules/reports.js - WITH BEAUTIFUL EMAIL MODAL
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,
    currentReport: null,

    initialize() {
        console.log('📈 Initializing reports...');
        
        // Get content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.renderModule();
        this.initialized = true;
        return true;
    },

    onThemeChange(theme) {
        console.log(`Reports module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                </div>

                <!-- Quick Stats Overview -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <!-- Report Categories -->
                <div class="reports-grid">
                    <!-- Financial Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">💰</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Production Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Inventory Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Sales Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Sales Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Health & Mortality Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🐔</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Health Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Feed Consumption Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Feed Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Farm Report -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center; grid-column: 1 / -1;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🏆</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Comprehensive Farm Report</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report" style="width: 100%; background: linear-gradient(135deg, #22c55e, #3b82f6);">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Section -->
                <div id="report-output" class="report-output glass-card hidden" style="margin-top: 32px;">
                    <div class="output-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin: 0;" id="report-title">Report Output</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn-outline" id="print-report-btn">
                                🖨️ Print
                            </button>
                            <button class="btn-outline" id="export-report-btn">
                                📥 Export
                            </button>
                            <button class="btn-outline" id="email-report-btn">
                                📧 Email
                            </button>
                            <button class="btn-outline" id="close-report-btn">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    <div class="output-content" style="padding: 24px;">
                        <div id="report-content">
                            <!-- Report content will be generated here -->
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Farm Activity</h3>
                    <div id="recent-activity">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>

            <!-- BEAUTIFUL EMAIL MODAL -->
            <div id="email-report-modal" class="email-modal-overlay hidden">
                <div class="email-modal-container glass-card">
                    <div class="email-modal-header">
                        <div class="email-modal-icon">📧</div>
                        <div>
                            <h3 class="email-modal-title">Send Report via Email</h3>
                            <p class="email-modal-subtitle">Share this report with team members or stakeholders</p>
                        </div>
                        <button class="email-modal-close" id="close-email-modal-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div class="email-modal-body">
                        <form id="email-report-form" class="email-form">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-icon">👤</span>
                                    Recipient Email Address
                                </label>
                                <input type="email" id="recipient-email" class="form-input" required 
                                       placeholder="name@example.com">
                                <div class="form-hint">You can enter multiple emails separated by commas</div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">
                                        <span class="label-icon">📋</span>
                                        Subject
                                    </label>
                                    <input type="text" id="email-subject" class="form-input" 
                                           placeholder="Farm Report - [Date]">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <span class="label-icon">📁</span>
                                        Format
                                    </label>
                                    <div class="format-options">
                                        <label class="format-option">
                                            <input type="radio" name="email-format" value="text" checked>
                                            <div class="format-card">
                                                <div class="format-icon">📝</div>
                                                <div class="format-name">Text</div>
                                            </div>
                                        </label>
                                        <label class="format-option">
                                            <input type="radio" name="email-format" value="html">
                                            <div class="format-card">
                                                <div class="format-icon">🎨</div>
                                                <div class="format-name">HTML</div>
                                            </div>
                                        </label>
                                        <label class="format-option">
                                            <input type="radio" name="email-format" value="pdf">
                                            <div class="format-card">
                                                <div class="format-icon">📄</div>
                                                <div class="format-name">PDF</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-icon">💬</span>
                                    Personal Message (Optional)
                                </label>
                                <textarea id="email-message" class="form-textarea" rows="4" 
                                          placeholder="Add a personal note to accompany the report..."></textarea>
                                <div class="form-hint">This message will be included above the report</div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-icon">⚡</span>
                                    Delivery Options
                                </label>
                                <div class="delivery-options">
                                    <label class="delivery-option">
                                        <input type="checkbox" id="urgent-delivery" name="urgent">
                                        <span class="delivery-text">Mark as urgent</span>
                                        <span class="delivery-badge">🚨</span>
                                    </label>
                                    <label class="delivery-option">
                                        <input type="checkbox" id="read-receipt" name="read-receipt">
                                        <span class="delivery-text">Request read receipt</span>
                                        <span class="delivery-badge">✓</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="email-modal-footer">
                        <div class="footer-actions">
                            <button class="btn-outline" id="cancel-email-btn">
                                <span>Cancel</span>
                            </button>
                            <button class="btn-primary" id="send-email-btn">
                                <span class="send-icon">✈️</span>
                                <span>Send Email</span>
                            </button>
                        </div>
                        <div class="footer-note">
                            <div class="note-icon">ℹ️</div>
                            <div class="note-text">Reports are sent instantly and stored in your sent items</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.addEmailModalStyles();
    },

    addEmailModalStyles() {
        const styleId = 'email-modal-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            /* Email Modal Overlay */
            .email-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                animation: fadeIn 0.3s ease-out;
            }

            .email-modal-overlay.hidden {
                display: none;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Email Modal Container */
            .email-modal-container {
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 24px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease-out;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Email Modal Header */
            .email-modal-header {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 28px 32px 20px;
                border-bottom: 1px solid var(--glass-border);
                position: relative;
            }

            .email-modal-icon {
                font-size: 40px;
                background: linear-gradient(135deg, #22c55e, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .email-modal-title {
                color: var(--text-primary);
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 4px 0;
            }

            .email-modal-subtitle {
                color: var(--text-secondary);
                font-size: 14px;
                margin: 0;
            }

            .email-modal-close {
                position: absolute;
                top: 24px;
                right: 24px;
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .email-modal-close:hover {
                color: var(--text-primary);
                background: var(--glass-hover);
            }

            /* Email Modal Body */
            .email-modal-body {
                padding: 24px 32px;
            }

            .email-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }

            .form-label {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-primary);
                font-weight: 600;
                font-size: 14px;
            }

            .label-icon {
                font-size: 16px;
            }

            .form-input, .form-textarea {
                padding: 12px 16px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                color: var(--text-primary);
                font-size: 14px;
                transition: all 0.2s ease;
                width: 100%;
            }

            .form-input:focus, .form-textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-textarea {
                resize: vertical;
                min-height: 100px;
            }

            .form-hint {
                color: var(--text-tertiary);
                font-size: 12px;
                margin-top: 4px;
            }

            /* Format Options */
            .format-options {
                display: flex;
                gap: 12px;
                margin-top: 8px;
            }

            .format-option {
                flex: 1;
            }

            .format-option input {
                display: none;
            }

            .format-card {
                padding: 16px;
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .format-option input:checked + .format-card {
                border-color: #3b82f6;
                background: rgba(59, 130, 246, 0.1);
            }

            .format-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }

            .format-name {
                color: var(--text-primary);
                font-weight: 600;
                font-size: 13px;
            }

            /* Delivery Options */
            .delivery-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 8px;
            }

            .delivery-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .delivery-option:hover {
                background: var(--glass-hover);
            }

            .delivery-option input {
                margin: 0;
            }

            .delivery-text {
                flex: 1;
                color: var(--text-primary);
                font-size: 14px;
            }

            .delivery-badge {
                font-size: 14px;
                opacity: 0.7;
            }

            /* Email Modal Footer */
            .email-modal-footer {
                padding: 20px 32px 28px;
                border-top: 1px solid var(--glass-border);
            }

            .footer-actions {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }

            .footer-actions .btn-outline,
            .footer-actions .btn-primary {
                flex: 1;
                padding: 14px 24px;
                font-size: 14px;
                font-weight: 600;
            }

            .send-icon {
                margin-right: 8px;
            }

            .footer-note {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: rgba(59, 130, 246, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(59, 130, 246, 0.2);
            }

            .note-icon {
                font-size: 16px;
            }

            .note-text {
                color: var(--text-primary);
                font-size: 13px;
                line-height: 1.4;
            }

            /* Responsive Design */
            @media (max-width: 640px) {
                .email-modal-header {
                    padding: 24px;
                }

                .email-modal-body {
                    padding: 20px 24px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .format-options {
                    flex-wrap: wrap;
                }

                .format-option {
                    min-width: calc(50% - 6px);
                }

                .email-modal-footer {
                    padding: 20px 24px 24px;
                }

                .footer-actions {
                    flex-direction: column;
                }
            }

            /* Dark mode adjustments */
            @media (prefers-color-scheme: dark) {
                .email-modal-container {
                    background: rgba(30, 30, 30, 0.9);
                    backdrop-filter: blur(20px);
                }

                .form-input, .form-textarea, .format-card, .delivery-option {
                    background: rgba(255, 255, 255, 0.05);
                }
            }

            /* Loading state */
            .sending-email .btn-primary {
                position: relative;
                color: transparent;
            }

            .sending-email .btn-primary::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid transparent;
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Success animation */
            @keyframes successPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .email-sent .btn-primary {
                background: #22c55e;
                animation: successPulse 0.6s ease;
            }
        `;
        document.head.appendChild(styles);
    },

    setupEventListeners() {
        // Report generation buttons
        const financialBtn = document.querySelector('.generate-financial-report');
        const productionBtn = document.querySelector('.generate-production-report');
        const inventoryBtn = document.querySelector('.generate-inventory-report');
        const salesBtn = document.querySelector('.generate-sales-report');
        const healthBtn = document.querySelector('.generate-health-report');
        const feedBtn = document.querySelector('.generate-feed-report');
        const comprehensiveBtn = document.querySelector('.generate-comprehensive-report');
        
        if (financialBtn) financialBtn.addEventListener('click', () => this.generateFinancialReport());
        if (productionBtn) productionBtn.addEventListener('click', () => this.generateProductionReport());
        if (inventoryBtn) inventoryBtn.addEventListener('click', () => this.generateInventoryReport());
        if (salesBtn) salesBtn.addEventListener('click', () => this.generateSalesReport());
        if (healthBtn) healthBtn.addEventListener('click', () => this.generateHealthReport());
        if (feedBtn) feedBtn.addEventListener('click', () => this.generateFeedReport());
        if (comprehensiveBtn) comprehensiveBtn.addEventListener('click', () => this.generateComprehensiveReport());
        
        // Report action buttons
        const printBtn = document.getElementById('print-report-btn');
        const exportBtn = document.getElementById('export-report-btn');
        const emailBtn = document.getElementById('email-report-btn');
        const closeBtn = document.getElementById('close-report-btn');
        
        if (printBtn) printBtn.addEventListener('click', () => this.printReport());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportReport());
        if (emailBtn) emailBtn.addEventListener('click', () => this.showEmailModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeReport());
        
        // Email modal buttons
        const closeEmailModalBtn = document.getElementById('close-email-modal-btn');
        const cancelEmailBtn = document.getElementById('cancel-email-btn');
        const sendEmailBtn = document.getElementById('send-email-btn');
        
        if (closeEmailModalBtn) closeEmailModalBtn.addEventListener('click', () => this.hideEmailModal());
        if (cancelEmailBtn) cancelEmailBtn.addEventListener('click', () => this.hideEmailModal());
        if (sendEmailBtn) sendEmailBtn.addEventListener('click', () => this.sendEmailReport());

        // Format selection
        const formatOptions = document.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                formatOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    },

    // ... (keep all the existing methods: renderQuickStats, getFarmStats, renderRecentActivity, 
    // getRecentActivities, generateFinancialReport, generateProductionReport, generateInventoryReport,
    // generateSalesReport, generateHealthReport, generateFeedReport, generateComprehensiveReport,
    // showReport, addReportStyles, closeReport, printReport, exportReport, and all utility methods)

    showEmailModal() {
        if (!this.currentReport) {
            this.showNotification('Please generate a report first', 'error');
            return;
        }
        
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Pre-fill subject with report title and date
            const subjectInput = document.getElementById('email-subject');
            if (subjectInput) {
                const date = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                subjectInput.value = `${this.currentReport.title} - ${date}`;
            }
            
            // Focus on email input
            const emailInput = document.getElementById('recipient-email');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 100);
            }
            
            // Add animation class
            modal.classList.add('modal-visible');
        }
    },

    hideEmailModal() {
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            modal.classList.add('hiding');
            setTimeout(() => {
                modal.classList.remove('hidden', 'modal-visible', 'hiding');
                document.getElementById('email-report-form')?.reset();
            }, 300);
        }
    },

    async sendEmailReport() {
        const emailInput = document.getElementById('recipient-email');
        const subjectInput = document.getElementById('email-subject');
        const messageInput = document.getElementById('email-message');
        const formatRadios = document.querySelectorAll('input[name="email-format"]:checked');
        const urgentCheckbox = document.getElementById('urgent-delivery');
        const readReceiptCheckbox = document.getElementById('read-receipt');
        
        if (!emailInput?.value) {
            this.showNotification('Please enter recipient email', 'error');
            return;
        }
        
        // Get email addresses (support multiple emails)
        const emailAddresses = emailInput.value.split(',').map(email => email.trim()).filter(email => email);
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailAddresses.filter(email => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
            this.showNotification(`Invalid email format: ${invalidEmails.join(', ')}`, 'error');
            return;
        }
        
        // Show sending state
        const sendBtn = document.getElementById('send-email-btn');
        const originalText = sendBtn.innerHTML;
        sendBtn.classList.add('sending-email');
        sendBtn.disabled = true;
        
        // Prepare email data
        const emailData = {
            recipients: emailAddresses,
            subject: subjectInput?.value || `${this.currentReport.title}`,
            message: messageInput?.value || '',
            format: formatRadios[0]?.value || 'text',
            urgent: urgentCheckbox?.checked || false,
            readReceipt: readReceiptCheckbox?.checked || false,
            report: this.currentReport,
            timestamp: new Date().toISOString(),
            sent: true,
            status: 'sending'
        };
        
        try {
            // Simulate API call with loading state
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Save to localStorage (in a real app, this would be sent to a server)
            const sentEmails = JSON.parse(localStorage.getItem('farm-sent-emails') || '[]');
            emailData.status = 'sent';
            sentEmails.push(emailData);
            localStorage.setItem('farm-sent-emails', JSON.stringify(sentEmails));
            
            // Show success animation
            sendBtn.classList.remove('sending-email');
            sendBtn.classList.add('email-sent');
            sendBtn.innerHTML = '✓ Sent!';
            
            // Show success notification
            const recipientCount = emailAddresses.length;
            const recipientText = recipientCount === 1 ? 'recipient' : 'recipients';
            this.showNotification(`Report sent to ${recipientCount} ${recipientText}`, 'success');
            
            // Close modal after delay
            setTimeout(() => {
                this.hideEmailModal();
                // Reset button state
                setTimeout(() => {
                    sendBtn.classList.remove('email-sent');
                    sendBtn.innerHTML = originalText;
                    sendBtn.disabled = false;
                }, 500);
            }, 1000);
            
        } catch (error) {
            console.error('Error sending email:', error);
            
            // Reset button state
            sendBtn.classList.remove('sending-email');
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
            
            this.showNotification('Failed to send email. Please try again.', 'error');
        }
    },

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `email-notification ${type}`;
        
        // Add notification styles if not present
        if (!document.getElementById('email-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'email-notification-styles';
            style.textContent = `
                .email-notification {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    padding: 16px 24px;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(20px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 300px;
                    max-width: 400px;
                    animation: slideInRight 0.4s ease-out;
                    transform-origin: top right;
                }

                .email-notification.success {
                    border-left: 4px solid #22c55e;
                }

                .email-notification.error {
                    border-left: 4px solid #ef4444;
                }

                .email-notification::before {
                    content: '';
                    display: block;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .email-notification.success::before {
                    background: #22c55e;
                    content: '✓';
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .email-notification.error::before {
                    background: #ef4444;
                    content: '!';
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .email-notification-content {
                    flex: 1;
                    color: var(--text-primary);
                    font-size: 14px;
                    line-height: 1.4;
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add notification content
        notification.innerHTML = `
            <div class="email-notification-content">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds with animation
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },

    // ... (keep all the existing utility methods at the bottom)
};

// ==================== REGISTRATION ====================
console.log('📊 Reports module loaded successfully!');

// Register the module with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered successfully!');
} else {
    console.error('❌ FarmModules framework not found!');
    // Fallback: register when FarmModules is available
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            window.FarmModules.registerModule('reports', ReportsModule);
            console.log('✅ Reports module registered (delayed)!');
            clearInterval(checkFarmModules);
        }
    }, 100);
}
