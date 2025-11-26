// modules/inventory-check.js
console.log('Loading inventory-check module...');

const InventoryCheckModule = {
    name: 'inventory-check',
    initialized: false,

    initialize() {
        console.log('📦 Initializing inventory check...');
        this.renderInventory();
        this.initialized = true;
        return true;
    },

    renderInventory() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Inventory Management</h1>
                    <p style="color: #666; font-size: 16px;">Track your farm supplies and stock</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="add-item" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">➕</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Add Item</div>
                                <div style="font-size: 12px; color: #666;">Add new inventory item</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="low-stock" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">⚠️</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Low Stock</div>
                                <div style="font-size: 12px; color: #666;">View items needing restock</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Inventory Summary -->
                <div class="inventory-summary" style="margin-bottom: 30px;">
                    <div class="summary-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
                            <div style="font-size: 32px; color: #3b82f6; margin-bottom: 12px;">📦</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Items</div>
                            <div style="font-size: 28px; font-weight: bold; color: #1a1a1a;">0</div>
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
                            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">⚠️</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Low Stock</div>
                            <div style="font-size: 28px; font-weight: bold; color: #ef4444;">0</div>
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
                            <div style="font-size: 32px; color: #10b981; margin-bottom: 12px;">✅</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">In Stock</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">0</div>
                        </div>
                    </div>
                </div>

                <!-- Inventory List -->
                <div class="inventory-list">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px;">Inventory Items</h2>
                        <div style="display: flex; gap: 12px;">
                            <button style="
                                background: rgba(255, 255, 255, 0.9);
                                backdrop-filter: blur(20px);
                                -webkit-backdrop-filter: blur(20px);
                                border: 1px solid rgba(0, 0, 0, 0.1);
                                border-radius: 12px;
                                padding: 10px 16px;
                                color: #666;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                            ">Filter</button>
                            <button style="
                                background: rgba(59, 130, 246, 0.1);
                                border: 1px solid rgba(59, 130, 246, 0.2);
                                border-radius: 12px;
                                padding: 10px 16px;
                                color: #3b82f6;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                            ">Export</button>
                        </div>
                    </div>
                    
                    <div class="items-container" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div style="text-align: center; color: #666; padding: 60px 20px;">
                            <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
                            <div style="font-size: 18px; margin-bottom: 12px; font-weight: 600;">No inventory items</div>
                            <div style="font-size: 14px; color: #999; margin-bottom: 24px;">Start by adding your first inventory item</div>
                            <button style="
                                background: rgba(59, 130, 246, 0.1);
                                border: 1px solid rgba(59, 130, 246, 0.2);
                                border-radius: 12px;
                                padding: 12px 24px;
                                color: #3b82f6;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                            ">Add First Item</button>
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
    window.FarmModules.registerModule('inventory-check', InventoryCheckModule);
    console.log('✅ Inventory Check module registered');
}
