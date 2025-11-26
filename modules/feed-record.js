// modules/feed-record.js
console.log('Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,

    initialize() {
        console.log('🌾 Initializing feed record...');
        this.renderFeedRecords();
        this.initialized = true;
        return true;
    },

    renderFeedRecords() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Feed Management</h1>
                    <p style="color: #666; font-size: 16px;">Track feed usage and inventory</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="record-feed" style="
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
                            <div style="font-size: 28px;">🌾</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Record Feed</div>
                                <div style="font-size: 12px; color: #666;">Log daily feed usage</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="add-feed" style="
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
                            <div style="font-size: 28px;">📥</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Add Feed Stock</div>
                                <div style="font-size: 12px; color: #666;">Add new feed supply</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Feed Summary -->
                <div class="feed-summary" style="margin-bottom: 30px;">
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
                            <div style="font-size: 32px; color: #f59e0b; margin-bottom: 12px;">🌾</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Current Stock</div>
                            <div style="font-size: 28px; font-weight: bold; color: #1a1a1a;">0 kg</div>
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
                            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">📤</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Daily Usage</div>
                            <div style="font-size: 28px; font-weight: bold; color: #ef4444;">0 kg</div>
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
                            <div style="font-size: 32px; color: #10b981; margin-bottom: 12px;">📊</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Feed Cost</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">$0.00</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Feed Records -->
                <div class="feed-records">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px;">Recent Feed Records</h2>
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
                    
                    <div class="records-container" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div style="text-align: center; color: #666; padding: 40px 20px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No feed records yet</div>
                            <div style="font-size: 14px; color: #999;">Record your first feed usage</div>
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
    window.FarmModules.registerModule('feed-record', FeedRecordModule);
    console.log('✅ Feed Record module registered');
}
