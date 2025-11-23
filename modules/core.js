// modules/core.js - Minimal version
const FarmModules = {
    modules: {},
    appData: {
        inventory: [], transactions: [], production: [], 
        orders: [], sales: [], projects: [], feedRecords: []
    },

    registerModule: function(name, module) {
        this.modules[name] = module;
    },

    initializeModules: function() {
        for (const moduleName in this.modules) {
            if (this.modules[moduleName].initialize && !this.modules[moduleName].isAuthModule) {
                this.modules[moduleName].initialize();
            }
        }
    },

    saveDataToStorage: function() {
        try {
            localStorage.setItem('farmData', JSON.stringify(this.appData));
        } catch (error) {
            console.error('Save error:', error);
        }
    },

    loadDataFromStorage: function() {
        try {
            const saved = localStorage.getItem('farmData');
            if (saved) {
                this.appData = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    }
};
