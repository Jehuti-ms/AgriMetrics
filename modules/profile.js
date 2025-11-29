// In modules/orders.js - update the syncStatsWithProfile method:
syncStatsWithProfile() {
    try {
        const stats = this.calculateStats();
        
        // Use the global ProfileModule
        if (window.ProfileModule && window.ProfileModule.updateBusinessStats) {
            window.ProfileModule.updateBusinessStats('orders', {
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
                pendingOrders: stats.pendingOrders,
                monthlyOrders: stats.monthlyOrders,
                monthlyRevenue: stats.monthlyRevenue,
                totalCustomers: stats.totalCustomers,
                totalProducts: stats.totalProducts,
                avgOrderValue: parseFloat(stats.avgOrderValue.replace(/[^\d.-]/g, '')) || 0,
                completedOrders: stats.statusCounts.completed,
                paidOrders: stats.paymentCounts.paid
            });
        }
    } catch (error) {
        console.error('❌ Error syncing stats with profile:', error);
    }
}
