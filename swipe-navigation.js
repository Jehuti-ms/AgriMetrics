// swipe-navigation.js - CORRECT ORDER
(function() {
    'use strict';
    
    console.log('📱 Loading swipe navigation...');
    
    // IMPORTANT: This must match the EXACT order you want for swiping
    const sections = [
        'dashboard',           // Dashboard
        'income-expenses',     // Income & Expenses
        'inventory-check',     // Inventory
        'orders',              // Orders
        'sales-record',        // Sales
        'profile',             // Profile
        'production',          // Production
        'feed-record',         // Feed Management
        'broiler-mortality',   // Health & Mortality
        'reports'              // Reports & Analytics
    ];
    
    // Display names for toast messages
    const displayNames = {
        'dashboard': 'Dashboard',
        'income-expenses': 'Income & Expenses',
        'inventory-check': 'Inventory',
        'orders': 'Orders',
        'sales-record': 'Sales',
        'profile': 'Profile',
        'production': 'Production',
        'feed-record': 'Feed Management',
        'broiler-mortality': 'Health & Mortality',
        'reports': 'Reports & Analytics'
    };
    
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    
    function getCurrentSection() {
        // Method 1: Check active nav item
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            const view = activeNav.getAttribute('data-view');
            if (view && sections.includes(view)) {
                console.log('📍 Current section from nav:', view);
                return view;
            }
        }
        
        // Method 2: Check visible section in content area
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            const modules = document.querySelectorAll('.module-container');
            for (const module of modules) {
                if (module.offsetParent !== null) {
                    const title = module.querySelector('.module-title');
                    if (title) {
                        const titleText = title.textContent.toLowerCase();
                        for (const section of sections) {
                            const sectionName = displayNames[section]?.toLowerCase() || section.replace('-', ' ');
                            if (titleText.includes(sectionName) || titleText.includes(section)) {
                                console.log('📍 Current section from content:', section);
                                return section;
                            }
                        }
                    }
                }
            }
        }
        
        console.log('📍 Current section defaulting to: dashboard');
        return 'dashboard';
    }
    
    function navigateToSection(sectionId) {
        console.log(`🔄 Swipe navigating to: ${sectionId}`);
        
        const displayName = displayNames[sectionId] || sectionId.replace('-', ' ');
        showToast(`→ ${displayName}`);
        
        // Try multiple navigation methods
        if (window.app && typeof window.app.showSection === 'function') {
            window.app.showSection(sectionId);
        } 
        else if (window.FarmModules && typeof window.FarmModules.renderModule === 'function') {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                window.FarmModules.renderModule(sectionId, contentArea);
            }
        }
        else {
            const navItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
            if (navItem) {
                navItem.click();
            } else {
                console.error(`❌ Cannot navigate to ${sectionId}`);
                showToast(`❌ ${displayName} not found`, '#ef4444');
                return;
            }
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const newActiveNav = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (newActiveNav) {
            newActiveNav.classList.add('active');
        }
        
        if (navigator.vibrate) navigator.vibrate(30);
    }
    
    function showToast(message, color = '#22c55e') {
        const existing = document.querySelector('.swipe-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'swipe-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 600;
            z-index: 100000;
            white-space: nowrap;
            animation: swipeToastFade 1s ease forwards;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: system-ui, -apple-system, sans-serif;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1000);
    }
    
    // Add CSS
    if (!document.querySelector('#swipe-nav-style')) {
        const style = document.createElement('style');
        style.id = 'swipe-nav-style';
        style.textContent = `
            @keyframes swipeToastFade {
                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Touch event handlers
    document.addEventListener('touchstart', function(e) {
        const target = e.target;
        if (target.closest('input') || 
            target.closest('textarea') || 
            target.closest('select') ||
            target.closest('button') ||
            target.closest('.popout-modal') ||
            target.closest('.modal')) {
            return;
        }
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = true;
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        
        if (Math.abs(deltaX) > 15 && deltaY < 30) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
        
        console.log(`Swipe detected: deltaX=${deltaX}, deltaY=${deltaY}`);
        
        if (Math.abs(deltaX) > 50 && deltaY < 100) {
            const currentSection = getCurrentSection();
            const currentIndex = sections.indexOf(currentSection);
            
            console.log(`Current: ${currentSection} (${currentIndex + 1}/${sections.length})`);
            
            // Swipe left (negative) - go to next section
            if (deltaX < 0 && currentIndex < sections.length - 1) {
                const nextSection = sections[currentIndex + 1];
                console.log(`👉 Swipe LEFT: ${currentSection} → ${nextSection}`);
                navigateToSection(nextSection);
            }
            // Swipe right (positive) - go to previous section
            else if (deltaX > 0 && currentIndex > 0) {
                const prevSection = sections[currentIndex - 1];
                console.log(`👈 Swipe RIGHT: ${currentSection} ← ${prevSection}`);
                navigateToSection(prevSection);
            }
            else if (deltaX < 0 && currentIndex >= sections.length - 1) {
                console.log('📱 Already at last section');
                showToast('📱 Already at last section', '#f59e0b');
            }
            else if (deltaX > 0 && currentIndex <= 0) {
                console.log('📱 Already at first section');
                showToast('📱 Already at first section', '#f59e0b');
            }
        }
        
        isSwiping = false;
    });
    
    // Debug: Log all available nav items
    setTimeout(() => {
        console.log('📋 Swipe navigation order:');
        sections.forEach((section, index) => {
            const displayName = displayNames[section] || section;
            console.log(`  ${index + 1}. ${displayName} (${section})`);
        });
    }, 2000);
    
    // Show hint once
    if (!localStorage.getItem('swipe-hint-shown')) {
        setTimeout(() => {
            const hint = document.createElement('div');
            hint.style.cssText = `
                position: fixed;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(10px);
                color: white;
                padding: 12px 24px;
                border-radius: 40px;
                font-size: 14px;
                z-index: 100000;
                display: flex;
                gap: 25px;
                pointer-events: none;
                animation: swipeToastFade 3s ease forwards;
                font-weight: 500;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            hint.innerHTML = '<span>👈 Swipe left for next</span><span style="opacity:0.5">|</span><span>Swipe right for previous 👉</span>';
            document.body.appendChild(hint);
            localStorage.setItem('swipe-hint-shown', 'true');
            setTimeout(() => hint.remove(), 3000);
        }, 1500);
    }
    
    console.log('✅ Swipe navigation loaded!');
    console.log('📋 Swipe order:', sections.map(s => displayNames[s]).join(' → '));
})();
