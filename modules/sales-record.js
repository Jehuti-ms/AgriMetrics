// modules/sales-record.js - COMPLETE FIXED VERSION
console.log('💰 Loading Enhanced Sales Records module...');

// SalesRecord Module - Complete Solution
window.FarmModules = window.FarmModules || {};
window.FarmModules.SalesRecord = {
    // Sales data structure
    sales: [],
    
    // Initialize module
    init: function() {
        console.log('📊 SalesRecord module initialized');
        this.loadSales();
        this.migrateSalesDates(); // Run migration on every load
        this.renderSalesTable();
        this.setupEventListeners();
    },
    
    // Load sales from localStorage
    loadSales: function() {
        const saved = localStorage.getItem('farm_sales');
        if (saved) {
            try {
                this.sales = JSON.parse(saved);
                console.log(`📈 Loaded ${this.sales.length} sales records`);
            } catch (e) {
                console.error('❌ Error loading sales:', e);
                this.sales = [];
            }
        } else {
            this.sales = [];
            console.log('📊 No sales records found, starting fresh');
        }
    },
    
    // Save sales to localStorage
    saveSales: function() {
        try {
            localStorage.setItem('farm_sales', JSON.stringify(this.sales));
            console.log('💾 Sales saved successfully');
            return true;
        } catch (e) {
            console.error('❌ Error saving sales:', e);
            return false;
        }
    },
    
    // FIXED: Convert any date format to YYYY-MM-DD
    normalizeDate: function(dateString) {
        if (!dateString) {
            const today = new Date();
            return today.toISOString().split('T')[0];
        }
        
        // If already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        // If it's a full ISO string
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        
        // If it's in MM/DD/YYYY or DD/MM/YYYY format
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                // Try to determine format
                if (parts[0].length === 4) {
                    // YYYY/MM/DD
                    return dateString.replace(/\//g, '-');
                } else if (parts[2].length === 4) {
                    // MM/DD/YYYY or DD/MM/YYYY
                    // Assume MM/DD/YYYY for US format
                    const month = parts[0].padStart(2, '0');
                    const day = parts[1].padStart(2, '0');
                    const year = parts[2];
                    return `${year}-${month}-${day}`;
                }
            }
        }
        
        // If all else fails, return today's date
        console.warn(`⚠️ Could not parse date: ${dateString}, using today's date`);
        return new Date().toISOString().split('T')[0];
    },
    
    // Migrate all sales dates to YYYY-MM-DD format
    migrateSalesDates: function() {
        if (!this.sales.length) return;
        
        let migratedCount = 0;
        const originalSales = [...this.sales];
        
        this.sales = this.sales.map(sale => {
            const originalDate = sale.date;
            const normalizedDate = this.normalizeDate(originalDate);
            
            if (originalDate !== normalizedDate) {
                migratedCount++;
                console.log(`🔄 Migrating: ${originalDate} → ${normalizedDate}`);
                return { ...sale, date: normalizedDate };
            }
            return sale;
        });
        
        if (migratedCount > 0) {
            this.saveSales();
            console.log(`✅ Migrated ${migratedCount} sales records to YYYY-MM-DD format`);
        }
    },
    
    // Add a new sale
    addSale: function(product, quantity, price, date) {
        const normalizedDate = this.normalizeDate(date);
        const total = quantity * price;
        
        const newSale = {
            id: Date.now(),
            product: product.trim(),
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            total: total,
            date: normalizedDate,
            timestamp: new Date().toISOString()
        };
        
        this.sales.unshift(newSale); // Add to beginning for newest first
        this.saveSales();
        this.renderSalesTable();
        
        console.log(`✅ Sale added: ${product} on ${normalizedDate}`);
        return newSale;
    },
    
    // Delete a sale
    deleteSale: function(id) {
        const index = this.sales.findIndex(sale => sale.id === id);
        if (index !== -1) {
            const deleted = this.sales.splice(index, 1)[0];
            this.saveSales();
            this.renderSalesTable();
            console.log(`🗑️ Sale deleted: ${deleted.product} on ${deleted.date}`);
            return true;
        }
        return false;
    },
    
    // Get total sales
    getTotalSales: function() {
        return this.sales.reduce((sum, sale) => sum + sale.total, 0);
    },
    
    // Render sales table
    renderSalesTable: function() {
        const container = document.getElementById('sales-container');
        if (!container) return;
        
        const totalSales = this.getTotalSales();
        
        let html = `
            <div class="sales-header">
                <h3>Sales Records (${this.sales.length} transactions)</h3>
                <div class="total-sales">Total: $${totalSales.toFixed(2)}</div>
            </div>
        `;
        
        if (this.sales.length === 0) {
            html += `<p class="no-data">No sales records yet. Add your first sale below!</p>`;
        } else {
            html += `
                <table class="sales-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            this.sales.forEach(sale => {
                html += `
                    <tr>
                        <td>${sale.date}</td>
                        <td>${sale.product}</td>
                        <td>${sale.quantity}</td>
                        <td>$${sale.price.toFixed(2)}</td>
                        <td>$${sale.total.toFixed(2)}</td>
                        <td>
                            <button class="btn-delete" onclick="FarmModules.SalesRecord.deleteSale(${sale.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        container.innerHTML = html;
    },
    
    // Setup event listeners for the form
    setupEventListeners: function() {
        const form = document.getElementById('sales-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const product = document.getElementById('product').value;
            const quantity = document.getElementById('quantity').value;
            const price = document.getElementById('price').value;
            const dateInput = document.getElementById('date');
            const date = dateInput.value || new Date().toISOString().split('T')[0];
            
            // Validate inputs
            if (!product || !quantity || !price) {
                alert('Please fill in all fields');
                return;
            }
            
            if (parseFloat(quantity) <= 0 || parseFloat(price) <= 0) {
                alert('Quantity and price must be positive numbers');
                return;
            }
            
            this.addSale(product, quantity, price, date);
            
            // Reset form
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0]; // Set to today
        });
    },
    
    // Debug functions
    debugAllSalesDates: function() {
        console.group('🔍 Sales Date Debug Info');
        console.log(`Total sales: ${this.sales.length}`);
        this.sales.forEach((sale, index) => {
            console.log(`Sale ${index + 1}:`, {
                product: sale.product,
                originalDate: sale.date,
                normalizedDate: this.normalizeDate(sale.date),
                isStandardFormat: /^\d{4}-\d{2}-\d{2}$/.test(sale.date)
            });
        });
        console.groupEnd();
    },
    
    // Export sales data
    exportSales: function() {
        const dataStr = JSON.stringify(this.sales, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `farm-sales-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    },
    
    // Import sales data
    importSales: function(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                // Merge with existing sales, avoiding duplicates by ID
                imported.forEach(newSale => {
                    if (!this.sales.some(existing => existing.id === newSale.id)) {
                        // Normalize date before adding
                        newSale.date = this.normalizeDate(newSale.date);
                        this.sales.push(newSale);
                    }
                });
                this.saveSales();
                this.renderSalesTable();
                console.log(`✅ Imported ${imported.length} sales records`);
                return true;
            }
        } catch (e) {
            console.error('❌ Error importing sales:', e);
        }
        return false;
    },
    
    // Clear all sales (use with caution!)
    clearAllSales: function() {
        if (confirm('Are you sure you want to delete ALL sales records? This cannot be undone.')) {
            this.sales = [];
            this.saveSales();
            this.renderSalesTable();
            console.log('🗑️ All sales records cleared');
        }
    }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FarmModules.SalesRecord.init();
    });
} else {
    window.FarmModules.SalesRecord.init();
}

console.log('✅ SalesRecord module loaded successfully');
