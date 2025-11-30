/**
 * Enhanced ModalManager with Superior Positioning and Scrolling
 * Features: Sticky headers, focus management, responsive design, and theme support
 */

const ModalManager = {
    // Modal stack for z-index management and tracking
    modalStack: [],
    previouslyFocused: null,
    focusTrapHandlers: new Map(),

    /**
     * Initialize modal system with enhanced features
     */
    init() {
        console.log('🎯 Initializing Enhanced ModalManager...');
        
        this.setupGlobalListeners();
        this.initExistingModals();
        this.setupResizeHandler();
        
        console.log('✅ ModalManager initialized with positioning enhancements');
    },

    /**
     * Set up global event listeners with improved event handling
     */
    setupGlobalListeners() {
        // Escape key handler with stack awareness
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                const topModal = this.modalStack[this.modalStack.length - 1];
                this.close(topModal.id);
            }
        });

        // Backdrop click with improved detection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close(e.target.id);
            }
        });

        // Delegated close button handling
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.modal-close');
            if (closeBtn) {
                e.preventDefault();
                const modal = closeBtn.closest('.modal');
                if (modal) {
                    this.close(modal.id);
                }
            }
        });
    },

    /**
     * Handle window resize for responsive modal positioning
     */
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.repositionModals();
            }, 100);
        });
    },

    /**
     * Reposition all open modals on window resize
     */
    repositionModals() {
        this.modalStack.forEach(modalData => {
            const modal = document.getElementById(modalData.id);
            if (modal && !modal.classList.contains('hidden')) {
                this.centerModal(modal);
            }
        });
    },

    /**
     * Center modal with viewport awareness
     */
    centerModal(modal) {
        const content = modal.querySelector('.modal-content');
        if (!content) return;

        const viewportHeight = window.innerHeight;
        const modalHeight = content.offsetHeight;
        
        if (modalHeight >= viewportHeight * 0.9) {
            content.style.marginTop = '5vh';
            content.style.marginBottom = '5vh';
        } else {
            content.style.marginTop = 'auto';
            content.style.marginBottom = 'auto';
        }
    },

    /**
     * Initialize existing DOM modals with enhanced features
     */
    initExistingModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            
            // Enhanced close button handling
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.setAttribute('aria-label', 'Close modal');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close(modal.id);
                });
            });

            // Initialize sticky headers
            this.initStickyHeader(modal);
        });
    },

    /**
     * Initialize sticky header functionality
     */
    initStickyHeader(modal) {
        const header = modal.querySelector('.modal-header');
        const body = modal.querySelector('.modal-body');
        
        if (header && body) {
            // Add scroll shadow effect
            body.addEventListener('scroll', () => {
                if (body.scrollTop > 10) {
                    header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }
            });
        }
    },

    /**
     * Create a new modal with enhanced options
     */
    createModal(options = {}) {
        const {
            id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title = 'Modal',
            content = '',
            showFooter = true,
            showClose = true,
            size = 'medium',
            onClose = null,
            onConfirm = null,
            closeOnBackdrop = true,
            closeOnEscape = true
        } = options;

        // Clean up existing modal
        this.close(id);

        const modalHTML = `
            <div id="${id}" 
                 class="modal hidden" 
                 data-close-on-backdrop="${closeOnBackdrop}"
                 data-close-on-escape="${closeOnEscape}"
                 aria-modal="true"
                 role="dialog"
                 aria-labelledby="${id}-title">
                <div class="modal-content" data-modal-size="${size}">
                    <div class="modal-header">
                        <h3 class="modal-title" id="${id}-title">${title}</h3>
                        ${showClose ? 
                            `<button class="modal-close" aria-label="Close modal" title="Close (Esc)">
                                &times;
                            </button>` 
                            : ''}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${showFooter ? `
                    <div class="modal-footer">
                        <button class="btn btn-text modal-close" type="button">
                            Cancel
                        </button>
                        ${onConfirm ? 
                            `<button class="btn btn-primary modal-confirm" type="button">
                                Confirm
                            </button>` 
                            : ''}
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
     * Enhanced modal opening with positioning and focus management
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`❌ Modal not found: ${modalId}`);
            return false;
        }

        // Calculate z-index based on stack position
        const baseZIndex = 1000;
        const zIndex = baseZIndex + (this.modalStack.length * 10);
        
        modal.style.zIndex = zIndex;
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        
        // Body scroll lock
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = this.getScrollbarWidth() + 'px';

        // Add to stack
        const modalData = {
            id: modalId,
            zIndex: zIndex,
            previouslyFocused: document.activeElement
        };
        
        this.modalStack.push(modalData);

        // Enhanced positioning
        this.centerModal(modal);
        
        // Focus management
        this.focusModal(modal);
        
        // Initialize scrolling enhancements
        this.initStickyHeader(modal);

        console.log(`✅ Modal opened: ${modalId} (z-index: ${zIndex})`);
        return true;
    },

    /**
     * Enhanced modal closing with proper cleanup
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        const modalData = this.modalStack.find(m => m.id === modalId);
        
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        
        // Remove from stack
        this.modalStack = this.modalStack.filter(m => m.id !== modalId);
        
        // Clean up focus trap
        this.removeFocusTrap(modalId);

        // Restore body styles if no modals open
        if (this.modalStack.length === 0) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        // Restore focus
        if (modalData && modalData.previouslyFocused) {
            this.restoreFocus(modalData.previouslyFocused);
        }

        console.log(`✅ Modal closed: ${modalId}`);
        return true;
    },

    /**
     * Advanced focus management with trapping
     */
    focusModal(modal) {
        this.previouslyFocused = document.activeElement;
        
        // Find focusable elements
        const focusableElements = this.getFocusableElements(modal);
        
        if (focusableElements.length > 0) {
            // Focus first element
            focusableElements[0].focus();
            
            // Set up focus trap
            this.setupFocusTrap(modal, focusableElements);
        } else {
            // Fallback to modal content
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.setAttribute('tabindex', '-1');
                content.focus();
            }
        }
    },

    /**
     * Get all focusable elements within modal
     */
    getFocusableElements(modal) {
        const focusableSelectors = [
            'button:not([disabled])',
            '[href]:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');
        
        return Array.from(modal.querySelectorAll(focusableSelectors))
            .filter(el => {
                return el.offsetWidth > 0 || 
                       el.offsetHeight > 0 || 
                       el === document.activeElement;
            });
    },

    /**
     * Setup focus trap within modal
     */
    setupFocusTrap(modal, focusableElements) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const keydownHandler = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', keydownHandler);
        this.focusTrapHandlers.set(modal.id, keydownHandler);
    },

    /**
     * Remove focus trap when modal closes
     */
    removeFocusTrap(modalId) {
        const handler = this.focusTrapHandlers.get(modalId);
        if (handler) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.removeEventListener('keydown', handler);
            }
            this.focusTrapHandlers.delete(modalId);
        }
    },

    /**
     * Restore focus to previous element
     */
    restoreFocus(element) {
        if (element && typeof element.focus === 'function') {
            // Use setTimeout to ensure the modal is fully closed
            setTimeout(() => {
                if (document.body.contains(element)) {
                    element.focus();
                }
            }, 0);
        }
    },

    /**
     * Calculate scrollbar width for body lock
     */
    getScrollbarWidth() {
        // Create temporary measurement element
        const scrollDiv = document.createElement('div');
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';
        
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        
        return scrollbarWidth;
    },

    /**
     * Attach events to specific modal
     */
    attachModalEvents(modalId, onClose, onConfirm) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Confirm button
        const confirmBtn = modal.querySelector('.modal-confirm');
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const result = onConfirm();
                if (result !== false) { // Allow prevention of close
                    this.close(modalId);
                }
            });
        }

        // Custom close handler
        if (onClose) {
            const closeHandler = () => {
                onClose();
            };
            modal.addEventListener('modalClose', closeHandler);
        }
    },

    /**
     * Create modal with scrollable sections (convenience method)
     */
    createSectionedModal(options = {}) {
        const defaultContent = `
            <section class="modal-section">
                <h4>Introduction</h4>
                <p>Welcome to this modal. Scroll down to see more sections with sticky headers always visible.</p>
            </section>
            
            <section class="modal-section">
                <h4>Key Features</h4>
                <p>This modal features enhanced scrolling with proper section headings that remain accessible.</p>
                <p>Sticky headers ensure you always know where you are in the content.</p>
            </section>
            
            <section class="modal-section">
                <h4>Detailed Information</h4>
                <p>More comprehensive details about the topic at hand.</p>
                <p>The modal body is scrollable while headers and footers remain fixed.</p>
            </section>
            
            <section class="modal-section">
                <h4>Additional Content</h4>
                <p>Extra information that might be useful for decision making.</p>
            </section>
            
            <section class="modal-section">
                <h4>Conclusion</h4>
                <p>Summary and final thoughts on the presented information.</p>
            </section>
        `;

        return this.createModal({
            content: options.content || defaultContent,
            size: options.size || 'medium',
            ...options
        });
    },

    /**
     * Update modal content dynamically
     */
    updateContent(modalId, content) {
        const modalBody = document.querySelector(`#${modalId} .modal-body`);
        if (modalBody) {
            modalBody.innerHTML = content;
            
            // Re-initialize sticky headers for new content
            const modal = document.getElementById(modalId);
            if (modal) {
                this.initStickyHeader(modal);
            }
            
            console.log(`✅ Modal content updated: ${modalId}`);
            return true;
        }
        return false;
    },

    /**
     * Close all open modals
     */
    closeAll() {
        // Close in reverse order (top to bottom)
        const modalsToClose = [...this.modalStack].reverse();
        
        modalsToClose.forEach(modalData => {
            this.close(modalData.id);
        });
        
        console.log('✅ All modals closed');
    },

    /**
     * Check if modal is open
     */
    isOpen(modalId) {
        const modal = document.getElementById(modalId);
        return modal && !modal.classList.contains('hidden');
    },

    /**
     * Get current open modals
     */
    getOpenModals() {
        return this.modalStack.map(m => m.id);
    },

    /**
     * Get top modal (most recently opened)
     */
    getTopModal() {
        return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1] : null;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModalManager.init());
} else {
    ModalManager.init();
}

// Make available globally
window.ModalManager = ModalManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}
