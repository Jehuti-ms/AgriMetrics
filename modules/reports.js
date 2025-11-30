// Add these missing methods to your ReportsModule:

generateFinancialReport() {
    const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
    const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
    
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Calculate income by category
    const incomeByCategory = {};
    incomeTransactions.forEach(transaction => {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
    });

    // Calculate expenses by category
    const expensesByCategory = {};
    expenseTransactions.forEach(transaction => {
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
    });

    const reportContent = `
        <div class="report-section">
            <h4>💰 Financial Overview</h4>
            <div class="metric-row">
                <span class="metric-label">Total Income</span>
                <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Total Expenses</span>
                <span class="metric-value expense">${this.formatCurrency(totalExpenses)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Net Profit</span>
                <span class="metric-value ${netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(netProfit)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Profit Margin</span>
                <span class="metric-value ${profitMargin >= 0 ? 'profit' : 'expense'}">${profitMargin.toFixed(1)}%</span>
            </div>
        </div>

        <div class="report-section">
            <h4>📈 Income by Category</h4>
            ${Object.entries(incomeByCategory).map(([category, amount]) => `
                <div class="metric-row">
                    <span class="metric-label">${this.formatCategory(category)}</span>
                    <span class="metric-value income">${this.formatCurrency(amount)}</span>
                </div>
            `).join('')}
        </div>

        <div class="report-section">
            <h4>📉 Expenses by Category</h4>
            ${Object.entries(expensesByCategory).map(([category, amount]) => `
                <div class="metric-row">
                    <span class="metric-label">${this.formatCategory(category)}</span>
                    <span class="metric-value expense">${this.formatCurrency(amount)}</span>
                </div>
            `).join('')}
        </div>

        <div class="report-section">
            <h4>💡 Financial Insights</h4>
            <div style="padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <p style="margin: 0; color: #166534;">
                    ${this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)}
                </p>
            </div>
        </div>
    `;

    this.showReport('Financial Performance Report', reportContent);
},

generateProductionReport() {
    const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
    const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
    
    const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
    const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
    
    // Calculate production by product type
    const productionByProduct = {};
    production.forEach(record => {
        productionByProduct[record.product] = (productionByProduct[record.product] || 0) + record.quantity;
    });

    // Calculate quality distribution
    const qualityDistribution = {};
    production.forEach(record => {
        qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
    });

    // Get current stock
    const currentStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
    const mortalityRate = currentStock > 0 ? (totalMortality / currentStock) * 100 : 0;

    const reportContent = `
        <div class="report-section">
            <h4>🚜 Production Overview</h4>
            <div class="metric-row">
                <span class="metric-label">Total Production</span>
                <span class="metric-value">${totalProduction} units</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Current Stock</span>
                <span class="metric-value">${currentStock} birds</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Total Mortality</span>
                <span class="metric-value">${totalMortality} birds</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Mortality Rate</span>
                <span class="metric-value ${mortalityRate > 5 ? 'expense' : 'profit'}">${mortalityRate.toFixed(2)}%</span>
            </div>
        </div>

        <div class="report-section">
            <h4>📊 Production by Product</h4>
            ${Object.entries(productionByProduct).map(([product, quantity]) => `
                <div class="metric-row">
                    <span class="metric-label">${this.formatProductName(product)}</span>
                    <span class="metric-value">${quantity} units</span>
                </div>
            `).join('')}
        </div>

        <div class="report-section">
            <h4>⭐ Quality Distribution</h4>
            ${Object.entries(qualityDistribution).map(([quality, count]) => `
                <div class="metric-row">
                    <span class="metric-label">${this.formatQuality(quality)}</span>
                    <span class="metric-value">${count} records</span>
                </div>
            `).join('')}
        </div>

        <div class="report-section">
            <h4>📈 Production Insights</h4>
            <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                    ${this.getProductionInsights(totalProduction, mortalityRate, qualityDistribution)}
                </p>
            </div>
        </div>
    `;

    this.showReport('Production Analysis Report', reportContent);
},

// Add these helper methods as well:

getProductionInsights(totalProduction, mortalityRate, qualityDistribution) {
    if (totalProduction === 0) return "No production data recorded. Start tracking your farm's output.";
    if (mortalityRate > 10) return "⚠️ High mortality rate affecting production. Review flock management practices.";
    if (qualityDistribution['excellent'] > qualityDistribution['grade-b']) {
        return "✅ Excellent quality production! Maintain current standards and practices.";
    }
    return "Good production levels. Focus on quality improvement and mortality reduction.";
},

formatProductName(product) {
    const products = {
        'eggs': 'Eggs',
        'broilers': 'Broilers',
        'layers': 'Layers',
        'pork': 'Pork',
        'beef': 'Beef',
        'milk': 'Milk',
        'other': 'Other'
    };
    return products[product] || product;
}
