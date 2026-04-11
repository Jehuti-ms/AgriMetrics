// swipe-navigation.js - SIMPLIFIED WORKING VERSION
(function() {
    'use strict';
    
    console.log('📱 Loading swipe navigation...');
    
    // Define the order (matches your navigation)
    const sections = [
        'dashboard',           // 1. Dashboard
        'income-expenses',     // 2. Income & Expenses
        'inventory-check',     // 3. Inventory
        'orders',              // 4. Orders
        'sales-record',        // 5. Sales
        'profile',             // 6. Profile
        'production',          // 7. Production
        'feed-record',         // 8. Feed Management
        'broiler-mortality',   // 9. Health & Mortality
        'reports'              // 10. Reports & Analytics
    ];
    
    // Display names
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
    
    // Track current section internally
    let currentSectionIndex = 0;
    
    // Update current section based on visible content or active nav
    function updateCurrentSection() {
        // Method 1: Check active nav item
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            const view = activeNav.getAttribute('data-view');
            const index = sections.indexOf(view);
            if (index !== -1) {
                currentSectionIndex = index;
                console.log(`📍 Current section: ${sections[currentSectionIndex]} (${currentSectionIndex + 1}/${sections.length})`);
                return;
            }
        }
        
        // Method 2: Check visible module title
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            const visibleModules = contentArea.querySelectorAll('.module-container');
            for (const module of visibleModules) {
                if (module.offsetParent !== null) {
                    const title = module.querySelector('.module-title');
                    if (title) {
                        const titleText = title.textContent.toLowerCase();
                        for (let i = 0; i < sections.length; i++) {
                            const section = sections[i];
                            const displayName = displayNames[section].toLowerCase();
                            if (titleText.includes(displayName) || titleText.includes(section.replace('-', ' '))) {
                                currentSectionIndex = i;
                                console.log(`📍 Current section from content: ${sections[currentSectionIndex]}`);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    
    function navigateToSection(newIndex) {
        if (newIndex < 0 || newIndex >= sections.length) {
            console.log('📱 Cannot navigate - at edge');
            return;
        }
        
        const sectionId = sections[newIndex];
        const displayName = displayNames[sectionId];
        const direction = newIndex > currentSectionIndex ? '→' : '←';
        
        console.log(`🔄 Navigating: ${direction} ${displayName}`);
        
        // Show toast
        showToast(`${direction} ${displayName}`);
        
        // Navigate
        if (window.app && typeof window.app.showSection === 'function') {
            window.app.showSection(sectionId);
        } else {
            const navItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
            if (navItem) navItem.click();
        }
        
        // Update internal index after navigation
        setTimeout(() => {
            currentSectionIndex = newIndex;
            updateCurrentSection();
        }, 100);
        
        // Haptic feedback
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
    
    // Update current section when navigation happens
    function watchForNavigation() {
        // Listen for clicks on nav items
        document.addEventListener('click', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const view = navItem.getAttribute('data-view');
                const index = sections.indexOf(view);
                if (index !== -1) {
                    setTimeout(() => {
                        currentSectionIndex = index;
                        console.log(`📍 Navigation updated to: ${sections[currentSectionIndex]}`);
                    }, 200);
                }
            }
        });
        
        // Also watch for section changes via app
        const originalShowSection = window.app?.showSection;
        if (window.app && originalShowSection) {
            window.app.showSection = function(sectionId) {
                const index = sections.indexOf(sectionId);
                if (index !== -1) {
                    currentSectionIndex = index;
                    console.log(`📍 Section changed to: ${sectionId}`);
                }
                return originalShowSection.call(window.app, sectionId);
            };
        }
    }
    
    // Touch handlers
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    
    document.addEventListener('touchstart', function(e) {
        const target = e.target;
        if (target.closest('input') || 
            target.closest('textarea') || 
            target.closest('select') ||
            target.closest('button') ||
            target.closest('.popout-modal')) {
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
        
        if (Math.abs(deltaX) > 50 && deltaY < 100) {
            // Update current section before swiping
            updateCurrentSection();
            
            console.log(`Swipe: deltaX=${deltaX}, current index=${currentSectionIndex}`);
            
            // Swipe left (negative) - next section
            if (deltaX < 0 && currentSectionIndex < sections.length - 1) {
                navigateToSection(currentSectionIndex + 1);
            }
            // Swipe right (positive) - previous section
            else if (deltaX > 0 && currentSectionIndex > 0) {
                navigateToSection(currentSectionIndex - 1);
            }
            else if (deltaX < 0 && currentSectionIndex >= sections.length - 1) {
                showToast('📱 Already at last section', '#f59e0b');
            }
            else if (deltaX > 0 && currentSectionIndex <= 0) {
                showToast('📱 Already at first section', '#f59e0b');
            }
        }
        
        isSwiping = false;
    });
    
    // Initialize
    setTimeout(() => {
        updateCurrentSection();
        watchForNavigation();
        console.log('✅ Swipe navigation loaded!');
        console.log('📋 Order:', sections.map(s => displayNames[s]).join(' → '));
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
            `;
            hint.innerHTML = '<span>👈 Swipe left for next</span><span style="opacity:0.5">|</span><span>Swipe right for previous 👉</span>';
            document.body.appendChild(hint);
            localStorage.setItem('swipe-hint-shown', 'true');
            setTimeout(() => hint.remove(), 3000);
        }, 1500);
    }
})();
