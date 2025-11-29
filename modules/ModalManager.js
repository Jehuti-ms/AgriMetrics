/**
 * ModalManager - Centralized modal management system
 * Handles creation, styling, and behavior of all modals
 */

const ModalManager = {
    // Modal stack for tracking open modals
    modalStack: [],

    /**
     * Initialize the modal system
     */
    init() {
        console.log('🔧 Initializing ModalManager...');
        
        // Set up global event listeners
        this.setupGlobalListeners();
        
        // Initialize any existing modals in the DOM
        this.initExistingModals();
        
        console.log('✅ ModalManager initialized');
    },

    /**
     * Set up global event listeners
     */
    setupGlobalListeners() {
        // Escape key to close top modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                e.preventDefault();
                const topModal = this.modalStack[this.modalStack.length - 1];
                this.close(topModal);
            }
        });

        // Backdrop click detection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close(e.target.id);
            }
        });

        // Close button detection (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.closest('.modal-close')) {
                e.preventDefault();
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.close(modal.id);
                }
            }
        });
    },

    /**
     * Initialize modals that already exist in the DOM
     */
    initExistingModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            // Ensure they start hidden
            modal.classList.add('hidden');
            
            // Add close events to existing close buttons
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.close(modal.id);
                });
            });
        });
    },

    /**
     * Create a new modal dynamically
     */
    createModal(options = {}) {
        const {
            id = `modal-${Date.now()}`,
            title = 'Modal',
            content = '',
            showFooter = true,
            showClose = true,
            size = 'medium',
            onClose = null,
            onConfirm = null
        } = options;

        // Remove existing modal with same ID
        this.close(id);

        const modalHTML = `
            <div id="${id}" class="modal hidden" data-modal-size="${size}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        ${showClose ? '<button class="modal-close">&times;</button>' : ''}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${showFooter ? `
                    <div class="modal-footer">
                        <button class="btn btn-text modal-close">Cancel</button>
                        ${onConfirm ? '<button class="btn btn-primary modal-confirm">Confirm</button>' : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachModalEvents(id, onClose, onConfirm);
        
        return id;
    },

    /**
     * Open a modal with content (convenience method)
     */
    openWithContent(options) {
        const modalId = this.createModal(options);
        this.open(modalId);
        return modalId;
    },

    /**
     * Open a modal by ID
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Add to stack
            if (!this.modalStack.includes(modalId)) {
                this.modalStack.push(modalId);
            }
            
            console.log(`✅ Modal opened: ${modalId}`);
        } else {
            console.warn(`❌ Modal not found: ${modalId}`);
        }
    },

    /**
     * Close a modal by ID
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            
            // Remove from stack
            this.modalStack = this.modalStack.filter(id => id !== modalId);
            
            // Restore scroll if no modals open
            if (this.modalStack.length === 0) {
                document.body.style.overflow = '';
            }
            
            console.log(`✅ Modal closed: ${modalId}`);
        }
    },

    /**
     * Close all open modals
     */
    closeAll() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        this.modalStack = [];
        document.body.style.overflow = '';
        
        console.log('✅ All modals closed');
    },

    /**
     * Update modal content
     */
    updateContent(modalId, content) {
        const modalBody = document.querySelector(`#${modalId} .modal-body`);
        if (modalBody) {
            modalBody.innerHTML = content;
            console.log(`✅ Modal content updated: ${modalId}`);
        }
    },

    /**
     * Attach events to a specific modal
     */
    attachModalEvents(modalId, onClose, onConfirm) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Confirm button
        const confirmBtn = modal.querySelector('.modal-confirm');
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onConfirm();
                this.close(modalId);
            });
        }

        // Custom close handler
        if (onClose) {
            const closeHandler = () => {
                onClose();
                modal.removeEventListener('close', closeHandler);
            };
            modal.addEventListener('close', closeHandler);
        }
    },

    /**
     * Check if a modal is open
     */
    isOpen(modalId) {
        const modal = document.getElementById(modalId);
        return modal && !modal.classList.contains('hidden');
    },

    /**
     * Get all open modals
     */
    getOpenModals() {
        return this.modalStack;
    }
};

// Make it globally available
window.ModalManager = ModalManager;
