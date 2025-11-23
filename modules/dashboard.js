// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    template: `
        <div id="dashboard" class="section">
            <h1>Dashboard</h1>
            <p>Welcome to your Farm Management System</p>
            <div>
                <h3>Quick Stats</h3>
                <p>Total Records: <span id="total-records">0</span></p>
            </div>
        </div>
    `,
    
    initialize: function() {
        this.updateStats();
    },
    
    updateStats: function() {
        const total = Object.values(FarmModules.appData).reduce((sum, data) => sum + data.length, 0);
        const element = document.getElementById('total-records');
        if (element) {
            element.textContent = total;
        }
    }
});
