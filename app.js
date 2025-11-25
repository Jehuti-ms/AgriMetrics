// In the createTopNavigation() method, replace the navHTML with this:

createTopNavigation() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    // Get or create header
    let header = appContainer.querySelector('header');
    if (!header) {
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);
    }

    // Clear existing header content
    header.innerHTML = '';

    // Create top navigation with proper styling
    const navHTML = `
        <nav class="top-nav" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background-color: #ffffff;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px;">🌱</span>
                <span style="font-weight: 600; font-size: 18px; color: #2d3748;">Farm Management</span>
            </div>
            
            <div class="nav-items" style="display: flex; align-items: center; gap: 4px;">
                <button class="nav-item" data-view="dashboard" style="
                    display: flex;
                    align-items: center;
                    background: none;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    color: #4a5568;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 20px;">📊</span>
                    <span>Home</span>
                </button>

                <button class="nav-item" data-view="income-expenses" style="
                    display: flex;
                    align-items: center;
                    background: none;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    color: #4a5568;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 20px;">💰</span>
                    <span>Finance</span>
                </button>

                <button class="nav-item" data-view="inventory-check" style="
                    display: flex;
                    align-items: center;
                    background: none;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    color: #4a5568;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 20px;">📦</span>
                    <span>Inventory</span>
                </button>

                <button class="nav-item" data-view="more" style="
                    display: flex;
                    align-items: center;
                    background: none;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    color: #4a5568;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 20px;">⋮</span>
                    <span>More</span>
                </button>
            </div>
        </nav>

        <!-- More Menu Dropdown -->
        <div id="more-menu" class="more-menu hidden" style="
            position: fixed;
            top: 65px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            padding: 16px;
            z-index: 1001;
            min-width: 220px;
            border: 1px solid #e2e8f0;
        ">
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <button class="more-menu-item" data-view="feed-record" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">🌾</span>
                    <span>Feed Record</span>
                </button>

                <button class="more-menu-item" data-view="broiler-mortality" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">🐔</span>
                    <span>Health</span>
                </button>

                <button class="more-menu-item" data-view="production" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">🚜</span>
                    <span>Production</span>
                </button>

                <button class="more-menu-item" data-view="sales-record" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">💰</span>
                    <span>Sales</span>
                </button>

                <button class="more-menu-item" data-view="orders" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">📋</span>
                    <span>Orders</span>
                </button>

                <button class="more-menu-item" data-view="reports" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">📈</span>
                    <span>Reports</span>
                </button>

                <button class="more-menu-item" data-view="profile" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-align: left;
                    color: #4a5568;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    <span style="font-size: 18px; width: 24px;">👤</span>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    `;

    header.innerHTML = navHTML;
    
    // Add padding to main content to account for fixed header
    const main = appContainer.querySelector('main');
    if (main) {
        main.style.paddingTop = '70px';
        main.style.minHeight = 'calc(100vh - 70px)';
    }
    
    // Also ensure content area has proper padding
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        contentArea.style.paddingTop = '20px';
    }
    
    console.log('✅ Top navigation created with visible labels and icons');
}
