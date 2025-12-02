// modules/modal-manager.js - Reusable Modal System
console.log('Loading Modal Manager...');

const ModalManager = {
    modals: {},
    currentModal: null,
    callbacks: {},

    // Initialize modal system
    initialize() {
        console.log('⚡ Initializing Modal Manager...');
        
        // Add global styles if not already added
        this.addGlobalStyles();
        
        // Add global event listeners
        this.addGlobalEventListeners();
        
        console.log('✅ Modal Manager initialized');
    },

    // Add global modal styles
    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            body.modal-open {
                overflow: hidden;
                padding-right: var(--scrollbar-width, 0);
            }
            
            .modal-fade-in {
                animation: modalFadeIn 0.3s ease;
            }
            
            @keyframes modalFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Add global event listeners
    addGlobalEventListeners() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeCurrentModal();
            }
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') && this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });
    },

    // Create a modal
    createModal(options) {
        const modalId = options.id || `modal-${Date.now()}`;
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container ${options.size || 'modal-md'} ${options.type || ''}">
                    <div class="modal-header">
                        <div>
                            <h2 class="modal-title">${options.title || 'Modal'}</h2>
                            ${options.subtitle ? `<p class="modal-subtitle">${options.subtitle}</p>` : ''}
                        </div>
                        <button class="modal-close" data-modal="${modalId}">✕</button>
                    </div>
                    <div class="modal-body ${options.scrollable ? 'modal-body-scroll' : ''}">
                        ${options.content || ''}
                    </div>
                    ${options.footer ? `
                        <div class="modal-footer">
                            ${options.footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Store modal reference
        this.modals[modalId] = {
            id: modalId,
            element: document.getElementById(modalId),
            options: options,
            callbacks: {}
        };

        // Add close event listener
        const closeBtn = document.querySelector(`[data-modal="${modalId}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modalId));
        }

        // Add callback for onOpen
        if (options.onOpen && typeof options.onOpen === 'function') {
            this.modals[modalId].callbacks.onOpen = options.onOpen;
        }

        // Add callback for onClose
        if (options.onClose && typeof options.onClose === 'function') {
            this.modals[modalId].callbacks.onClose = options.onClose;
        }

        return modalId;
    },

    // Show a modal
    showModal(modalId, data = null) {
        const modal = this.modals[modalId];
        if (!modal || !modal.element) {
            console.error(`Modal ${modalId} not found`);
            return false;
        }

        // Prevent body scrolling
        document.body.classList.add('modal-open');
        
        // Set current modal
        this.currentModal = modalId;
        
        // Show modal
        modal.element.classList.add('active');
        
        // Call onOpen callback with data
        if (modal.callbacks.onOpen) {
            modal.callbacks.onOpen(data);
        }

        return true;
    },

    // Close a modal
    closeModal(modalId, result = null) {
        const modal = this.modals[modalId];
        if (!modal || !modal.element) {
            console.error(`Modal ${modalId} not found`);
            return false;
        }

        // Hide modal
        modal.element.classList.remove('active');
        
        // Reset body scrolling
        document.body.classList.remove('modal-open');
        
        // Reset current modal
        if (this.currentModal === modalId) {
            this.currentModal = null;
        }
        
        // Call onClose callback with result
        if (modal.callbacks.onClose) {
            modal.callbacks.onClose(result);
        }

        return true;
    },

    // Close current modal
    closeCurrentModal(result = null) {
        if (this.currentModal) {
            return this.closeModal(this.currentModal, result);
        }
        return false;
    },

    // Create and show a modal in one step
    show(options, data = null) {
        const modalId = this.createModal(options);
        if (modalId) {
            this.showModal(modalId, data);
            return modalId;
        }
        return null;
    },

    // Create a quick form modal
    createQuickForm(options) {
        const formId = `quick-form-${Date.now()}`;
        
        const fieldsHTML = options.fields.map(field => {
            let fieldHTML = '';
            
            switch(field.type) {
                case 'number':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <input type="number" 
                                   class="quick-form-input ${field.large ? 'quick-form-amount' : ''}" 
                                   id="${formId}-${field.name}" 
                                   name="${field.name}"
                                   ${field.required ? 'required' : ''}
                                   ${field.min !== undefined ? `min="${field.min}"` : ''}
                                   ${field.max !== undefined ? `max="${field.max}"` : ''}
                                   ${field.step !== undefined ? `step="${field.step}"` : ''}
                                   ${field.value ? `value="${field.value}"` : ''}
                                   ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                   ${field.autofocus ? 'autofocus' : ''}>
                            ${field.note ? `<div class="quick-form-note">${field.note}</div>` : ''}
                            <div class="quick-form-error" id="${formId}-${field.name}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'text':
                case 'email':
                case 'password':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <input type="${field.type}" 
                                   class="quick-form-input" 
                                   id="${formId}-${field.name}" 
                                   name="${field.name}"
                                   ${field.required ? 'required' : ''}
                                   ${field.value ? `value="${field.value}"` : ''}
                                   ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                   ${field.autofocus ? 'autofocus' : ''}>
                            <div class="quick-form-error" id="${formId}-${field.name}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'textarea':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <textarea class="quick-form-input quick-form-textarea" 
                                      id="${formId}-${field.name}" 
                                      name="${field.name}"
                                      ${field.required ? 'required' : ''}
                                      ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                      rows="${field.rows || 3}">${field.value || ''}</textarea>
                            <div class="quick-form-error" id="${formId}-${field.name}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'select':
                    const optionsHTML = field.options.map(opt => 
                        `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                    
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <select class="quick-form-input" 
                                    id="${formId}-${field.name}" 
                                    name="${field.name}"
                                    ${field.required ? 'required' : ''}>
                                ${optionsHTML}
                            </select>
                            <div class="quick-form-error" id="${formId}-${field.name}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'category':
                    const categoriesHTML = field.categories.map(cat => 
                        `<button type="button" class="quick-category-btn" data-value="${cat.value}">${cat.label}</button>`
                    ).join('');
                    
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <div class="quick-categories">
                                ${categoriesHTML}
                            </div>
                            <input type="hidden" 
                                   id="${formId}-${field.name}" 
                                   name="${field.name}"
                                   value="${field.defaultValue || ''}"
                                   ${field.required ? 'required' : ''}>
                            <div class="quick-form-error" id="${formId}-${field.name}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'icon':
                    const iconsHTML = field.icons.map(icon => 
                        `<button type="button" class="quick-icon-btn" data-value="${icon.value}">${icon.label}</button>`
                    ).join('');
                    
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <div class="quick-icons">
                                ${iconsHTML}
                            </div>
                            <input type="hidden" 
                                   id="${formId}-${field.name}" 
                                   name="${field.name}"
                                   value="${field.defaultValue || ''}"
                                   ${field.required ? 'required' : ''}>
                            <div class="quick-form-error" id="${formId}-${field.name}-error"></div>
                        </div>
                    `;
                    break;
            }
            
            return fieldHTML;
        }).join('');

        const content = `
            <form id="${formId}" class="quick-form">
                ${fieldsHTML}
            </form>
        `;

        const footer = `
            <button type="button" class="btn btn-outline" data-cancel>Cancel</button>
            <button type="submit" class="btn btn-primary" form="${formId}">${options.submitText || 'Submit'}</button>
        `;

        const modalId = this.createModal({
            id: options.id,
            title: options.title,
            subtitle: options.subtitle,
            size: options.size || 'modal-md',
            type: options.type,
            content: content,
            footer: footer,
            onOpen: (data) => {
                // Set form values from data
                if (data) {
                    Object.keys(data).forEach(key => {
                        const input = document.getElementById(`${formId}-${key}`);
                        if (input) {
                            input.value = data[key];
                        }
                    });
                }
                
                // Focus on first input
                const firstInput = document.querySelector(`#${formId} .quick-form-input`);
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
                
                // Add category selection handlers
                document.querySelectorAll(`#${formId} .quick-category-btn`).forEach(btn => {
                    btn.addEventListener('click', function() {
                        const categoryGroup = this.closest('.quick-form-group');
                        categoryGroup.querySelectorAll('.quick-category-btn').forEach(b => {
                            b.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        const hiddenInput = categoryGroup.querySelector('input[type="hidden"]');
                        if (hiddenInput) {
                            hiddenInput.value = this.dataset.value;
                        }
                    });
                    
                    // Set active if matches default value
                    const hiddenInput = btn.closest('.quick-form-group').querySelector('input[type="hidden"]');
                    if (hiddenInput && hiddenInput.value === btn.dataset.value) {
                        btn.classList.add('active');
                    }
                });
                
                // Add icon selection handlers
                document.querySelectorAll(`#${formId} .quick-icon-btn`).forEach(btn => {
                    btn.addEventListener('click', function() {
                        const iconGroup = this.closest('.quick-form-group');
                        iconGroup.querySelectorAll('.quick-icon-btn').forEach(b => {
                            b.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        const hiddenInput = iconGroup.querySelector('input[type="hidden"]');
                        if (hiddenInput) {
                            hiddenInput.value = this.dataset.value;
                        }
                    });
                });
                
                // Add cancel button handler
                const cancelBtn = document.querySelector(`[data-modal="${modalId}"] ~ .modal-footer [data-cancel]`);
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => this.closeModal(modalId, null));
                }
            },
            onClose: (result) => {
                // Call submit callback if form was submitted
                if (result && options.onSubmit) {
                    options.onSubmit(result);
                }
                
                // Remove form from DOM
                const form = document.getElementById(formId);
                if (form) {
                    form.remove();
                }
            }
        });

        // Add form submit handler
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validate form
                if (!this.validateForm(formId, options.fields)) {
                    return;
                }
                
                // Get form data
                const formData = {};
                options.fields.forEach(field => {
                    const input = document.getElementById(`${formId}-${field.name}`);
                    if (input) {
                        formData[field.name] = field.type === 'number' ? 
                            parseFloat(input.value) || 0 : 
                            input.value;
                    }
                });
                
                // Close modal with form data
                this.closeModal(modalId, formData);
            });
        }

        return modalId;
    },

    // Validate form
    validateForm(formId, fields) {
        let isValid = true;
        
        fields.forEach(field => {
            const input = document.getElementById(`${formId}-${field.name}`);
            const errorElement = document.getElementById(`${formId}-${field.name}-error`);
            
            if (!input) return;
            
            // Clear previous error
            if (errorElement) {
                errorElement.classList.remove('show');
                errorElement.textContent = '';
                input.classList.remove('error');
            }
            
            // Validate required field
            if (field.required && !input.value.trim()) {
                isValid = false;
                this.showError(formId, field.name, 'This field is required');
                return;
            }
            
            // Validate number field
            if (field.type === 'number') {
                const value = parseFloat(input.value);
                if (isNaN(value)) {
                    isValid = false;
                    this.showError(formId, field.name, 'Please enter a valid number');
                    return;
                }
                
                if (field.min !== undefined && value < field.min) {
                    isValid = false;
                    this.showError(formId, field.name, `Minimum value is ${field.min}`);
                    return;
                }
                
                if (field.max !== undefined && value > field.max) {
                    isValid = false;
                    this.showError(formId, field.name, `Maximum value is ${field.max}`);
                    return;
                }
            }
            
            // Validate email field
            if (field.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    this.showError(formId, field.name, 'Please enter a valid email address');
                    return;
                }
            }
        });
        
        return isValid;
    },

    // Show error for a field
    showError(formId, fieldName, message) {
        const input = document.getElementById(`${formId}-${fieldName}`);
        const errorElement = document.getElementById(`${formId}-${fieldName}-error`);
        
        if (input) {
            input.classList.add('error');
            input.focus();
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    // Create confirmation modal
    confirm(options) {
        return new Promise((resolve) => {
            const modalId = this.createModal({
                title: options.title || 'Confirm',
                subtitle: options.subtitle,
                size: 'modal-sm',
                type: options.type || 'modal-warning',
                content: `
                    <div class="confirmation-content">
                        <div class="confirmation-icon">${options.icon || '⚠️'}</div>
                        <p class="confirmation-message">${options.message || 'Are you sure?'}</p>
                        ${options.details ? `<p class="confirmation-details">${options.details}</p>` : ''}
                    </div>
                `,
                footer: `
                    <button type="button" class="btn btn-outline" data-action="cancel">Cancel</button>
                    <button type="button" class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">
                        ${options.confirmText || 'Confirm'}
                    </button>
                `,
                onOpen: () => {
                    // Add button handlers
                    document.querySelectorAll(`[data-modal="${modalId}"] ~ .modal-footer button`).forEach(btn => {
                        btn.addEventListener('click', () => {
                            const action = btn.dataset.action;
                            this.closeModal(modalId, action === 'confirm');
                        });
                    });
                },
                onClose: (result) => {
                    resolve(result);
                }
            });
            
            this.showModal(modalId);
        });
    },

    // Create loading modal
    showLoading(options = {}) {
        const modalId = this.createModal({
            id: 'loading-modal',
            title: options.title || 'Loading',
            subtitle: options.subtitle,
            size: 'modal-sm',
            content: `
                <div class="modal-loading">
                    <div class="modal-loading-spinner"></div>
                    <p class="modal-loading-text">${options.message || 'Please wait...'}</p>
                </div>
            `,
            footer: ''
        });
        
        this.showModal(modalId);
        return modalId;
    },

    // Hide loading modal
    hideLoading() {
        this.closeModal('loading-modal');
    },

    // Create alert modal
    alert(options) {
        return new Promise((resolve) => {
            const modalId = this.createModal({
                title: options.title || 'Alert',
                subtitle: options.subtitle,
                size: 'modal-sm',
                type: options.type || 'modal-info',
                content: `
                    <div class="confirmation-content">
                        <div class="confirmation-icon">${options.icon || 'ℹ️'}</div>
                        <p class="confirmation-message">${options.message}</p>
                        ${options.details ? `<p class="confirmation-details">${options.details}</p>` : ''}
                    </div>
                `,
                footer: `
                    <button type="button" class="btn btn-primary" data-action="ok">OK</button>
                `,
                onOpen: () => {
                    // Add button handler
                    const okBtn = document.querySelector(`[data-modal="${modalId}"] ~ .modal-footer button`);
                    if (okBtn) {
                        okBtn.addEventListener('click', () => {
                            this.closeModal(modalId, true);
                        });
                    }
                },
                onClose: () => {
                    resolve(true);
                }
            });
            
            this.showModal(modalId);
        });
    },

    // Create reports modal
    showReports(options) {
        const reportsHTML = options.reports.map(report => `
            <div class="report-card" data-report="${report.id}">
                <div class="report-icon">${report.icon || '📊'}</div>
                <h4 class="report-title">${report.title}</h4>
                <p class="report-desc">${report.description}</p>
            </div>
        `).join('');

        const content = `
            <div class="reports-grid">
                ${reportsHTML}
            </div>
            <div id="report-preview" class="mt-4 p-4 border rounded hidden">
                <!-- Report preview will be displayed here -->
            </div>
        `;

        const modalId = this.createModal({
            id: options.id || 'reports-modal',
            title: options.title || 'Reports',
            subtitle: options.subtitle || 'Select a report to generate',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary hidden" id="generate-report-btn">
                    Generate Report
                </button>
            `,
            onOpen: () => {
                let selectedReport = null;
                
                // Add report selection handlers
                document.querySelectorAll('.report-card').forEach(card => {
                    card.addEventListener('click', () => {
                        // Update selection
                        document.querySelectorAll('.report-card').forEach(c => {
                            c.classList.remove('selected');
                        });
                        card.classList.add('selected');
                        
                        selectedReport = card.dataset.report;
                        
                        // Show preview
                        const preview = document.getElementById('report-preview');
                        const generateBtn = document.getElementById('generate-report-btn');
                        
                        const report = options.reports.find(r => r.id === selectedReport);
                        if (report && report.preview) {
                            preview.innerHTML = report.preview;
                            preview.classList.remove('hidden');
                            generateBtn.classList.remove('hidden');
                            generateBtn.textContent = report.buttonText || 'Generate Report';
                        }
                    });
                });
                
                // Add generate button handler
                const generateBtn = document.getElementById('generate-report-btn');
                if (generateBtn) {
                    generateBtn.addEventListener('click', () => {
                        if (selectedReport && options.onReportSelect) {
                            options.onReportSelect(selectedReport);
                            this.closeModal(modalId);
                        }
                    });
                }
                
                // Add close button handler
                const closeBtn = document.querySelector('[data-action="close"]');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.closeModal(modalId));
                }
            }
        });

        this.showModal(modalId);
        return modalId;
    }
};

// Initialize Modal Manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModalManager.initialize());
} else {
    ModalManager.initialize();
}

// Export for global access
window.ModalManager = ModalManager;
console.log('✅ Modal Manager loaded');
