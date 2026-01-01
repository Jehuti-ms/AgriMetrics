// modules/data-broadcaster.js
console.log('📡 Loading Data Broadcaster...');

const DataBroadcaster = {
    // Quick helpers for common actions
    recordCreated(moduleName, data) {
        console.log(`📡 [${moduleName}] Record created:`, data);
        this._broadcastToDashboard(moduleName, 'create', data);
        this._addActivity(moduleName, 'create', data);
    },
    
    recordUpdated(moduleName, data) {
        console.log(`📡 [${moduleName}] Record updated:`, data);
        this._broadcastToDashboard(moduleName, 'update', data);
        this._addActivity(moduleName, 'update', data);
    },
    
    recordDeleted(moduleName, data) {
        console.log(`📡 [${moduleName}] Record deleted:`, data);
        this._broadcastToDashboard(moduleName, 'delete', data);
        this._addActivity(moduleName, 'delete', data);
    },
    
    // Internal methods
    _broadcastToDashboard(moduleName, action, data) {
        // Method 1: Use DashboardModule
        if (window.DashboardModule && window.DashboardModule.broadcastDataChange) {
            window.DashboardModule.broadcastDataChange(moduleName, {
                action: action,
                data: data,
                timestamp: new Date().toISOString()
            });
        }
        
        // Method 2: Custom event
        const event = new CustomEvent('farmDataChanged', {
            detail: { module: moduleName, action: action, data: data }
        });
        document.dispatchEvent(event);
    },
    
    _addActivity(moduleName, action, data) {
        if (!window.DashboardModule || !window.DashboardModule.addRecentActivity) return;
        
        const activity = this._createActivity(moduleName, action, data);
        window.DashboardModule.addRecentActivity(activity);
    },
    
    _createActivity(moduleName, action, data) {
        const icons = {
            'income-expenses': data?.type === 'income' ? '💰' : '💸',
            'feed-record': '🌾',
            'inventory-check': '📦',
            'production': '🚜',
            'sales-record': '🛒',
            'orders': '📋',
            'broiler-mortality': '😔'
        };
        
        const titles = {
            'create': 'Record Created',
            'update': 'Record Updated',
            'delete': 'Record Deleted'
        };
        
        const descriptions = {
            'income-expenses': `${data?.description || 'Transaction'} - $${parseFloat(data?.amount || 0).toFixed(2)}`,
            'feed-record': `${data?.quantity || 0}kg ${data?.feedType || 'feed'}`,
            'inventory-check': `${data?.itemName || 'Item'} - Qty: ${data?.quantity || 0}`,
            'production': `${data?.product || 'Product'} - ${data?.quantity || 0} units`,
            'sales-record': `${data?.customerName || 'Sale'} - $${parseFloat(data?.total || 0).toFixed(2)}`,
            'orders': `Order #${data?.id || ''} - ${data?.customerName || 'Customer'}`,
            'broiler-mortality': `${data?.quantity || 0} birds - ${data?.cause || 'Unknown'}`
        };
        
        return {
            icon: icons[moduleName] || '📊',
            title: titles[action] || 'Activity',
            description: descriptions[moduleName] || 'Data updated',
            module: moduleName
        };
    }
};

// Make it globally available
window.DataBroadcaster = DataBroadcaster;
console.log('✅ Data Broadcaster ready');
