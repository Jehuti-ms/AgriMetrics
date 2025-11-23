// In core.js - update showNotification method
showNotification(message, type = 'info') {
    // Check if document.body exists
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

    // Add styles if not already added
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
                .notification-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
                .notification-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .notification-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
                .notification-info { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
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
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
