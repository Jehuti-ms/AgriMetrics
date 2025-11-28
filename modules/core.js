// core.js - COMPATIBLE JAVESCRIPT
console.log('Loading core module...');

const CoreModule = {
    name: 'core',
    initialized: false,

    initialize: function() {
        console.log('✅ Core module initializing...');
        this.setupErrorHandling();
        this.initialized = true;
        return true;
    },

    setupErrorHandling: function() {
        var self = this;
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
        });
    },

    showNotification: function(message, type) {
        var container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        var notification = document.createElement('div');
        notification.className = 'notification ' + (type || 'info');
        notification.innerHTML = 
            '<span>' + (message || '') + '</span>' +
            '<button onclick="this.parentElement.remove()">&times;</button>';

        container.appendChild(notification);

        setTimeout(function() {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    formatCurrency: function(amount) {
        if (isNaN(amount)) {
            amount = 0;
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        var date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        var options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    debounce: function(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
};

// Register core module
if (typeof window.CoreModule === 'undefined') {
    window.coreModule = CoreModule;
    console.log('✅ Core module registered');
}
