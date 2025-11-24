// modules/core.js
console.log('Loading core module...');

class CoreModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Core module initialized');
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    showNotification(message, type = 'info') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createNotification(message, type);
            });
        } else {
            this.createNotification(message, type);
        }
    }

    createNotification(message, type) {
        if (!document.body) {
            console.log(`[${type}] ${message}`);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        if (!document.querySelector('#notification-styles')) {
            const styles = `
                <style>
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 1rem 1.5rem;
                        border-radius: 8px;
                        color: white;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        max-width: 400px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        animation: slideIn 0.3s ease-out;
                    }
                    .notification-success { background: #22c55e; }
                    .notification-error { background: #ef4444; }
                    .notification-warning { background: #f59e0b; }
                    .notification-info { background: #3b82f6; }
                    .notification button {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.2rem;
                        cursor: pointer;
                        padding: 0;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }

        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        try {
            return new Date(date).toLocaleDateString('en-US');
        } catch (e) {
            return 'Invalid date';
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

window.coreModule = new CoreModule();
