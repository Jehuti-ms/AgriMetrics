// modules/income-expenses.js
console.log('Loading income-expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,

    initialize() {
        console.log('💰 Initializing income & expenses...');
        this.renderIncomeExpenses();
        this.initialized = true;
        return true;
    },

    renderIncomeExpenses() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Income & Expenses</h1>
                    <p style="color: #666; font-size: 16px;">Manage your farm finances</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                        margin-bottom: 20px;
                    ">
                        <button class="action-btn" data-action="add-income" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 24px;">💰</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Add Income</div>
                                <div style="font-size: 12px; color: #666;">Record new income</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="add-expense" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 24px;">💸</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Add Expense</div>
                                <div style="font-size: 12px; color: #666;">Record new expense</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="summary-cards" style="margin-bottom: 30px;">
                    <div class="cards-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 16px;
                    ">
                        <div class="summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #10b981; margin-bottom: 12px;">📈</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Income</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">$0.00</div>
                        </div>

                        <div class="summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">📉</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Expenses</div>
                            <div style="font-size: 28px; font-weight: bold; color: #ef4444;">$0.00</div>
                        </div>

                        <div class="summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #3b82f6; margin-bottom: 12px;">💼</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Net Profit</div>
                            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">$0.00</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="recent-transactions">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px;">Recent Transactions</h2>
                        <button style="
                            background: rgba(59, 130, 246, 0.1);
                            border: 1px solid rgba(59, 130, 246, 0.2);
                            border-radius: 12px;
                            padding: 10px 16px;
                            color: #3b82f6;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                        ">View All</button>
                    </div>
                    
                    <div class="transactions-list" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div style="text-align: center; color: #666; padding: 40px 20px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">💳</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No transactions yet</div>
                            <div style="font-size: 14px; color: #999;">Add your first income or expense</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    setupEventListeners() {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    e.currentTarget.style.transform = 'scale(1)';
                }, 150);
            });

            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });
        });
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}
