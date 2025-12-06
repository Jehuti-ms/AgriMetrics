// modules/modal-manager.js - Enhanced Modal System
console.log('Loading Modal Manager...');

const ModalManager = {
    modals: {},
    currentModal: null,
    callbacks: {},
    modalCount: 0,

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
        if (document.getElementById('modal-manager-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-manager-styles';
        style.textContent = `
            /* Modal Overlay */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                padding: 1rem;
            }
            
            .modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            /* Modal Container */
            .modal-container {
                background: var(--surface-color);
                backdrop-filter: var(--surface-blur);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-hover-color);
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                transform: translateY(20px);
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            
            .modal-overlay.active .modal-container {
                transform: translateY(0);
            }
            
            /* Modal Sizes */
            .modal-container.modal-sm {
                max-width: 400px;
            }
            
            .modal-container.modal-md {
                max-width: 500px;
            }
            
            .modal-container.modal-lg {
                max-width: 700px;
            }
            
            .modal-container.modal-xl {
                max-width: 900px;
            }
            
            /* Modal Header */
            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: var(--surface-color);
            }
            
            .modal-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
            }
            
            .modal-subtitle {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin-top: 0.25rem;
                margin-bottom: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.25rem;
                margin-left: 1rem;
                line-height: 1;
                border-radius: var(--radius);
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: var(--border-color);
                color: var(--text-primary);
            }
            
            /* Modal Body */
            .modal-body {
                padding: 1.5rem;
                flex: 1;
                overflow-y: auto;
            }
            
            .modal-body-scroll {
                max-height: 50vh;
                overflow-y: auto;
            }
            
            /* Modal Footer */
            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 0.75rem;
                background: var(--surface-color);
            }
            
            /* Form Styles */
            .quick-form-group {
                margin-bottom: 1.25rem;
            }
            
            .quick-form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--text-primary);
                font-size: 0.875rem;
            }
            
            .quick-form-label.required::after {
                content: " *";
                color: var(--error-color);
            }
            
            .quick-form-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                background: var(--surface-color);
                color: var(--text-primary);
                font-size: 1rem;
                transition: all 0.2s ease;
            }
            
            .quick-form-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
            }
            
            .quick-form-input.error {
                border-color: var(--error-color);
            }
            
            .quick-form-textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .quick-form-amount {
                font-size: 1.25rem;
                font-weight: 600;
                text-align: center;
                padding: 1rem;
            }
            
            .quick-form-note {
                font-size: 0.75rem;
                color: var(--text-secondary);
                margin-top: 0.25rem;
            }
            
            .quick-form-error {
                font-size: 0.75rem;
                color: var(--error-color);
                margin-top: 0.25rem;
                display: none;
            }
            
            .quick-form-error.show {
                display: block;
            }
            
            /* Category & Icon Selectors */
            .quick-categories,
            .quick-icons {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .quick-category-btn,
            .quick-icon-btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--border-color);
                background: var(--surface-color);
                border-radius: var(--radius);
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .quick-category-btn:hover,
            .quick-icon-btn:hover {
                border-color: var(--primary-color);
                background: rgba(34, 197, 94, 0.05);
            }
            
            .quick-category-btn.active,
            .quick-icon-btn.active {
                border-color: var(--primary-color);
                background: var(--primary-color);
                color: white;
            }
            
            /* Confirmation Modal */
            .confirmation-content {
                text-align: center;
                padding: 1rem 0;
            }
            
            .confirmation-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .confirmation-message {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            
            .confirmation-details {
                font-size: 0.875rem;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            
            /* Loading Modal */
            .modal-loading {
                text-align: center;
                padding: 2rem 0;
            }
            
            .modal-loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--border-color);
                border-top-color: var(--primary-color);
                border-radius: 50%;
                margin: 0 auto 1rem;
                animation: modal-spin 1s linear infinite;
            }
            
            .modal-loading-text {
                color: var(--text-secondary);
                font-size: 0.875rem;
            }
            
            @keyframes modal-spin {
                to { transform: rotate(360deg); }
            }
            
            /* Reports Modal */
            .reports-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .report-card {
                padding: 1.5rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                background: var(--surface-color);
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
            }
            
            .report-card:hover {
                transform: translateY(-2px);
                border-color: var(--primary-color);
                box-shadow: var(--shadow-color);
            }
            
            .report-card.selected {
                border-color: var(--primary-color);
                background: rgba(34, 197, 94, 0.05);
            }
            
            .report-icon {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            
            .report-title {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }
            
            .report-desc {
                font-size: 0.75rem;
                color: var(--text-secondary);
                line-height: 1.4;
            }
            
            /* Dark Mode Adjustments */
            .dark-mode .modal-container {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
            }
            
            .dark-mode .modal-header,
            .dark-mode .modal-footer {
                background: var(--surface-color);
            }
            
            /* Body Scroll Lock */
            body.modal-open {
                overflow: hidden;
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
                const modal = this.modals[this.currentModal];
                if (modal && modal.options.closeOnOverlayClick !== false) {
                    this.closeModal(this.currentModal);
                }
            }
        });
    },

    // Create a modal
    createModal(options) {
        this.modalCount++;
        const modalId = options.id || `modal-${this.modalCount}`;
        
        // Check for existing modal
        if (this.modals[modalId] && this.modals[modalId].element) {
            this.modals[modalId].element.remove();
        }
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-container ${options.size || 'modal-md'} ${options.type || ''}">
                    <div class="modal-header">
                        <div>
                            <h2 class="modal-title">${options.title || 'Modal'}</h2>
                            ${options.subtitle ? `<p class="modal-subtitle">${options.subtitle}</p>` : ''}
                        </div>
                        <button class="modal-close" data-modal="${modalId}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
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
        
        const modalElement = document.getElementById(modalId);
        
        // Store modal reference
        this.modals[modalId] = {
            id: modalId,
            element: modalElement,
            options: {
                closeOnOverlayClick: options.closeOnOverlayClick !== false,
                ...options
            },
            callbacks: {}
        };

        // Add close event listener
        const closeBtn = modalElement.querySelector(`.modal-close`);
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeModal(modalId);
            });
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
        setTimeout(() => {
            modal.element.classList.add('active');
        }, 10);
        
        // Call onOpen callback with data
        if (modal.callbacks.onOpen) {
            setTimeout(() => {
                modal.callbacks.onOpen(data);
            }, 50);
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
        
        // Remove modal after animation
        setTimeout(() => {
            if (modal.element && modal.element.parentNode) {
                modal.element.remove();
            }
            
            // Clean up reference
            delete this.modals[modalId];
            
            // Reset current modal if this was the current one
            if (this.currentModal === modalId) {
                this.currentModal = null;
            }
            
            // Reset body scrolling if no more modals
            if (Object.keys(this.modals).length === 0) {
                document.body.classList.remove('modal-open');
            }
            
            // Call onClose callback with result
            if (modal.callbacks.onClose) {
                modal.callbacks.onClose(result);
            }
        }, 300);

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
    createForm(options) {
        const formId = `form-${Date.now()}`;
        
        const fieldsHTML = options.fields.map(field => {
            let fieldHTML = '';
            const fieldId = `${formId}-${field.name}`;
            
            switch(field.type) {
                case 'number':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label for="${fieldId}" class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <input type="number" 
                                   class="quick-form-input ${field.large ? 'quick-form-amount' : ''}" 
                                   id="${fieldId}" 
                                   name="${field.name}"
                                   ${field.required ? 'required' : ''}
                                   ${field.min !== undefined ? `min="${field.min}"` : ''}
                                   ${field.max !== undefined ? `max="${field.max}"` : ''}
                                   ${field.step !== undefined ? `step="${field.step}"` : ''}
                                   value="${field.value || ''}"
                                   ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                   ${field.autofocus ? 'autofocus' : ''}>
                            ${field.note ? `<div class="quick-form-note">${field.note}</div>` : ''}
                            <div class="quick-form-error" id="${fieldId}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'text':
                case 'email':
                case 'password':
                case 'date':
                case 'time':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label for="${fieldId}" class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <input type="${field.type}" 
                                   class="quick-form-input" 
                                   id="${fieldId}" 
                                   name="${field.name}"
                                   ${field.required ? 'required' : ''}
                                   value="${field.value || ''}"
                                   ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                   ${field.autofocus ? 'autofocus' : ''}>
                            <div class="quick-form-error" id="${fieldId}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'textarea':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label for="${fieldId}" class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <textarea class="quick-form-input quick-form-textarea" 
                                      id="${fieldId}" 
                                      name="${field.name}"
                                      ${field.required ? 'required' : ''}
                                      ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                      rows="${field.rows || 4}">${field.value || ''}</textarea>
                            <div class="quick-form-error" id="${fieldId}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'select':
                    const optionsHTML = field.options.map(opt => 
                        `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                    
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label for="${fieldId}" class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <select class="quick-form-input" 
                                    id="${fieldId}" 
                                    name="${field.name}"
                                    ${field.required ? 'required' : ''}>
                                ${optionsHTML}
                            </select>
                            <div class="quick-form-error" id="${fieldId}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'checkbox':
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                <input type="checkbox" 
                                       class="quick-form-input" 
                                       id="${fieldId}" 
                                       name="${field.name}"
                                       value="true"
                                       ${field.checked ? 'checked' : ''}
                                       ${field.required ? 'required' : ''}>
                                ${field.label}
                            </label>
                            <div class="quick-form-error" id="${fieldId}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'radio':
                    const radiosHTML = field.options.map((opt, index) => 
                        `<label class="quick-form-label">
                            <input type="radio" 
                                   name="${field.name}" 
                                   value="${opt.value}"
                                   ${field.required ? 'required' : ''}
                                   ${field.value === opt.value ? 'checked' : ''}>
                            ${opt.label}
                        </label>`
                    ).join('');
                    
                    fieldHTML = `
                        <div class="quick-form-group">
                            <label class="quick-form-label ${field.required ? 'required' : ''}">
                                ${field.label}
                            </label>
                            <div class="radio-group">
                                ${radiosHTML}
                            </div>
                            <div class="quick-form-error" id="${fieldId}-error"></div>
                        </div>
                    `;
                    break;
                    
                case 'category':
                    const categoriesHTML = field.options.map(opt => 
                        `<button type="button" class="quick-category-btn" data-value="${opt.value}">${opt.label}</button>`
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
                                   id="${fieldId}" 
                                   name="${field.name}"
                                   value="${field.value || ''}"
                                   ${field.required ? 'required' : ''}>
                            <div class="quick-form-error" id="${fieldId}-error"></div>
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
            <button type="button" class="btn btn-outline" data-action="cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" form="${formId}">
                ${options.submitText || 'Save'}
            </button>
        `;

        const modalId = this.createModal({
            id: options.id,
            title: options.title,
            subtitle: options.subtitle,
            size: options.size || 'modal-md',
            content: content,
            footer: footer,
            closeOnOverlayClick: false,
            onOpen: (data) => {
                // Set form values from data
                if (data) {
                    Object.keys(data).forEach(key => {
                        const input = document.getElementById(`${formId}-${key}`);
                        if (input) {
                            if (input.type === 'checkbox') {
                                input.checked = Boolean(data[key]);
                            } else {
                                input.value = data[key];
                            }
                        }
                    });
                }
                
                // Add category selection handlers
                const form = document.getElementById(formId);
                form.querySelectorAll('.quick-category-btn').forEach(btn => {
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
                });
                
                // Focus on first input
                const firstInput = form.querySelector('.quick-form-input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
                
                // Add cancel button handler
                const cancelBtn = form.closest('.modal-container').querySelector('[data-action="cancel"]');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => this.closeModal(modalId, null));
                }
            },
            onClose: (result) => {
                if (result && options.onSubmit) {
                    options.onSubmit(result);
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
                        if (input.type === 'checkbox') {
                            formData[field.name] = input.checked;
                        } else if (field.type === 'number') {
                            formData[field.name] = parseFloat(input.value) || 0;
                        } else {
                            formData[field.name] = input.value;
                        }
                    }
                });
                
                // Close modal with form data
                this.closeModal(modalId, formData);
            });
        }

        this.showModal(modalId);
        return modalId;
    },

    // Validate form
    validateForm(formId, fields) {
        let isValid = true;
        const form = document.getElementById(formId);
        
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field.name}"]`);
            const errorElement = document.getElementById(`${formId}-${field.name}-error`);
            
            if (!input) return;
            
            // Clear previous error
            if (errorElement) {
                errorElement.classList.remove('show');
                errorElement.textContent = '';
                input.classList.remove('error');
            }
            
            // Validate required field
            if (field.required) {
                const isCheckbox = input.type === 'checkbox';
                const isEmpty = isCheckbox ? false : !input.value.trim();
                
                if (isEmpty) {
                    isValid = false;
                    this.showError(formId, field.name, `${field.label} is required`);
                    return;
                }
            }
            
            // Validate number field
            if (field.type === 'number' && input.value) {
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
        const input = document.querySelector(`#${formId} [name="${fieldName}"]`);
        const errorElement = document.getElementById(`${formId}-${fieldName}-error`);
        
        if (input) {
            input.classList.add('error');
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                closeOnOverlayClick: false,
                onOpen: () => {
                    const modal = document.getElementById(modalId);
                    modal.querySelectorAll('[data-action]').forEach(btn => {
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

    // Create alert modal
    alert(options) {
        return new Promise((resolve) => {
            const modalId = this.createModal({
                title: options.title || 'Alert',
                subtitle: options.subtitle,
                size: 'modal-sm',
                content: `
                    <div class="confirmation-content">
                        <div class="confirmation-icon">${options.icon || 'ℹ️'}</div>
                        <p class="confirmation-message">${options.message || ''}</p>
                        ${options.details ? `<p class="confirmation-details">${options.details}</p>` : ''}
                    </div>
                `,
                footer: `
                    <button type="button" class="btn btn-primary" data-action="ok">OK</button>
                `,
                onOpen: () => {
                    const modal = document.getElementById(modalId);
                    modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
                        this.closeModal(modalId);
                    });
                },
                onClose: () => {
                    resolve(true);
                }
            });
            
            this.showModal(modalId);
        });
    },

    // Show loading modal
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
            closeOnOverlayClick: false
        });
        
        this.showModal(modalId);
        return modalId;
    },

    // Hide loading modal
    hideLoading() {
        this.closeModal('loading-modal');
    },

    // Create info modal
    info(options) {
        return new Promise((resolve) => {
            const modalId = this.createModal({
                title: options.title || 'Information',
                subtitle: options.subtitle,
                size: options.size || 'modal-md',
                content: options.content || options.message || '',
                footer: `
                    <button type="button" class="btn btn-primary" data-action="close">Close</button>
                `,
                onOpen: () => {
                    const modal = document.getElementById(modalId);
                    modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                        this.closeModal(modalId);
                    });
                },
                onClose: () => {
                    resolve(true);
                }
            });
            
            this.showModal(modalId);
        });
    },

    // Create error modal
    error(options) {
        return new Promise((resolve) => {
            const modalId = this.createModal({
                title: options.title || 'Error',
                subtitle: options.subtitle,
                size: 'modal-sm',
                content: `
                    <div class="confirmation-content">
                        <div class="confirmation-icon">❌</div>
                        <p class="confirmation-message">${options.message || 'An error occurred'}</p>
                        ${options.details ? `<p class="confirmation-details">${options.details}</p>` : ''}
                    </div>
                `,
                footer: `
                    <button type="button" class="btn btn-primary" data-action="close">OK</button>
                `,
                onOpen: () => {
                    const modal = document.getElementById(modalId);
                    modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                        this.closeModal(modalId);
                    });
                },
                onClose: () => {
                    resolve(true);
                }
            });
            
            this.showModal(modalId);
        });
    },

    // Create success modal
    success(options) {
        return new Promise((resolve) => {
            const modalId = this.createModal({
                title: options.title || 'Success',
                subtitle: options.subtitle,
                size: 'modal-sm',
                content: `
                    <div class="confirmation-content">
                        <div class="confirmation-icon">✅</div>
                        <p class="confirmation-message">${options.message || 'Operation completed successfully'}</p>
                        ${options.details ? `<p class="confirmation-details">${options.details}</p>` : ''}
                    </div>
                `,
                footer: `
                    <button type="button" class="btn btn-primary" data-action="close">OK</button>
                `,
                onOpen: () => {
                    const modal = document.getElementById(modalId);
                    modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                        this.closeModal(modalId);
                    });
                },
                onClose: () => {
                    resolve(true);
                }
            });
            
            this.showModal(modalId);
        });
    },

    // Create custom modal with custom content
    custom(options) {
        return this.show({
            title: options.title,
            subtitle: options.subtitle,
            size: options.size || 'modal-md',
            content: options.content,
            footer: options.footer,
            onOpen: options.onOpen,
            onClose: options.onClose,
            closeOnOverlayClick: options.closeOnOverlayClick !== false
        });
    },

    // Clean up all modals
    cleanup() {
        Object.keys(this.modals).forEach(modalId => {
            this.closeModal(modalId);
        });
        this.modals = {};
        this.currentModal = null;
    }
};

// In ModalManager.js - Add this method to your ModalManager object
showReports(options) {
    const modalId = this.createModal({
        id: options.id || 'reports-modal',
        title: options.title || 'Reports',
        subtitle: options.subtitle || 'Select a report to generate',
        size: options.size || 'modal-lg',
        content: `
            <div class="reports-selection">
                <div class="reports-grid">
                    ${(options.reports || []).map(report => `
                        <div class="report-card" data-report="${report.id}">
                            <div class="report-icon">${report.icon || '📊'}</div>
                            <h4 class="report-title">${report.title}</h4>
                            <p class="report-desc">${report.description}</p>
                        </div>
                    `).join('')}
                </div>
                <div id="report-preview" class="report-preview hidden">
                    <!-- Report preview will be displayed here -->
                </div>
            </div>
        `,
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
                    
                    const report = (options.reports || []).find(r => r.id === selectedReport);
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
            const closeBtn = document.querySelector(`[data-modal="${modalId}"] ~ .modal-footer [data-action="close"]`);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modalId));
            }
        }
    });

    this.showModal(modalId);
    return modalId;
}

// In ModalManager class or object
showReceiptReviewModal: function(options) {
    const { receipt, extractedData } = options;
    
    const fields = [
        {
            type: 'select',
            name: 'transaction-type',
            label: 'Transaction Type',
            value: extractedData?.type || 'expense',
            options: [
                { value: 'income', label: '💰 Income' },
                { value: 'expense', label: '💸 Expense' }
            ]
        },
        {
            type: 'text',
            name: 'description',
            label: 'Description',
            value: `Receipt: ${receipt.name}`,
            required: true,
            placeholder: 'Enter transaction description'
        },
        {
            type: 'number',
            name: 'amount',
            label: 'Amount ($)',
            value: extractedData?.amount || '',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: '0.00'
        },
        {
            type: 'select',
            name: 'category',
            label: 'Category',
            value: extractedData?.category || '',
            options: this.getCategoryOptions(extractedData?.type || 'expense')
        },
        {
            type: 'date',
            name: 'date',
            label: 'Date',
            value: extractedData?.date || new Date().toISOString().split('T')[0]
        },
        {
            type: 'text',
            name: 'vendor',
            label: 'Vendor/Supplier',
            value: extractedData?.vendor || '',
            placeholder: 'Who issued this receipt?'
        },
        {
            type: 'textarea',
            name: 'notes',
            label: 'Notes',
            value: `Imported from receipt: ${receipt.name}`,
            rows: 3,
            placeholder: 'Additional notes...'
        }
    ];

    // Use your existing createForm method
    return this.createForm({
        id: 'receipt-review-modal',
        title: '🔍 Review Receipt Data',
        subtitle: `From: ${receipt.name}`,
        size: 'modal-lg',
        fields: fields,
        submitText: 'Add Transaction',
        onSubmit: options.onSubmit
    });
},

getCategoryOptions: function(type) {
    // This should get categories from the IncomeExpensesModule
    if (window.IncomeExpensesModule) {
        return window.IncomeExpensesModule.getCategoryOptions(type);
    }
    
    // Fallback
    return [
        { value: '', label: 'Select a category' },
        { value: 'feed', label: '🌾 Feed & Nutrition' },
        { value: 'medication', label: '💊 Healthcare' },
        { value: 'equipment', label: '🔧 Equipment' }
    ];
},

showReports: function(options) {
    const modalId = this.createModal({
        id: options.id || 'reports-modal',
        title: options.title || 'Reports',
        subtitle: options.subtitle || 'Select a report to generate',
        size: options.size || 'modal-lg',
        content: `
            <div class="reports-selection">
                <div class="reports-grid">
                    ${(options.reports || []).map(report => `
                        <div class="report-card" data-report="${report.id}">
                            <div class="report-icon">${report.icon || '📊'}</div>
                            <h4 class="report-title">${report.title}</h4>
                            <p class="report-desc">${report.description}</p>
                        </div>
                    `).join('')}
                </div>
                <div id="report-preview" class="report-preview hidden">
                    <!-- Report preview will be displayed here -->
                </div>
            </div>
        `,
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
                    
                    const report = (options.reports || []).find(r => r.id === selectedReport);
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
            const closeBtn = document.querySelector(`[data-modal="${modalId}"] ~ .modal-footer [data-action="close"]`);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modalId));
            }
        }
    });

    this.showModal(modalId);
    return modalId;
}
}; // This closes the ModalManager object

// Initialize Modal Manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModalManager.initialize());
} else {
    ModalManager.initialize();
}

// Export for global access
window.ModalManager = ModalManager;
window.Modal = ModalManager; // Shorter alias
console.log('✅ Modal Manager loaded');
