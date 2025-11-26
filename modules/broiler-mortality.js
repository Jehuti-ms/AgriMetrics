// modules/broiler-mortality.js
console.log('Loading broiler-mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,

    initialize() {
        console.log('🐔 Initializing broiler mortality...');
        this.renderMortality();
        this.initialized = true;
        return true;
    },

    renderMortality() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Broiler Health & Mortality</h1>
                    <p style="color: #666; font-size: 16px;">Monitor flock health and track losses</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="record-mortality" style="
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
                            <div style="font-size: 28px;">😔</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Record Mortality</div>
                                <div style="font-size: 12px; color: #666;">Log bird losses</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="health-check" style="
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
                            <div style="font-size: 28px;">❤️</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Health Check</div>
                                <div style="font-size: 12px; color: #666;">Record health status</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Health Overview -->
                <div class="health-overview" style="margin-bottom: 30px;">
                    <div class="overview-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <div class="overview-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #10b981; margin-bottom: 12px;">🐔</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Active Birds</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">0</div>
                        </div>

                        <div class="overview-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">😔</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Losses</div>
                            <div style="font-size: 28px; font-weight: bold; color: #ef4444;">0</div>
                        </div>

                        <div class="overview-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #f59e0b; margin-bottom: 12px;">📊</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Mortality Rate</div>
                            <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">0%</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Mortality Records -->
                <div class="mortality-records">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px;">Recent Health Records</h2>
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
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No health records yet</div>
                            <div style="font-size: 14px; color: #999;">Record your first health check or mortality</div>
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
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
    console.log('✅ Broiler Mortality module registered');
}
