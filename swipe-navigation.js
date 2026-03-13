// ==================== SWIPE NAVIGATION WITH DEBUGGING ====================
const SwipeNavigation = {
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    minSwipeDistance: 50, // Reduced from 100 to make it easier
    minVerticalThreshold: 30, // Prevent vertical swipes from triggering
    enabled: true,
    
    init: function() {
        console.log('👆 Initializing swipe navigation...');
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('❌ Content area not found');
            return;
        }
        
        console.log('✅ Content area found, attaching touch listeners');
        
        // Touch events
        contentArea.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            console.log(`👉 Touch start at X: ${this.touchStartX}, Y: ${this.touchStartY}`);
        }, { passive: true });
        
        contentArea.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;
            
            console.log(`👆 Touch end at X: ${this.touchEndX}, Y: ${this.touchEndY}`);
            console.log(`📏 Horizontal distance: ${this.touchEndX - this.touchStartX}`);
            console.log(`📏 Vertical distance: ${this.touchEndY - this.touchStartY}`);
            
            this.handleSwipe();
        }, { passive: true });
        
        // Also log for debugging
        console.log('✅ Swipe navigation initialized - try swiping now!');
    },
    
    handleSwipe: function() {
        if (!this.enabled) {
            console.log('⏸️ Swipe navigation disabled');
            return;
        }
        
        const horizontalDistance = this.touchEndX - this.touchStartX;
        const verticalDistance = Math.abs(this.touchEndY - this.touchStartY);
        
        // Check if it's a horizontal swipe (not too much vertical movement)
        if (verticalDistance > this.minVerticalThreshold) {
            console.log('❌ Too much vertical movement - not a horizontal swipe');
            return;
        }
        
        console.log(`✅ Valid horizontal swipe detected: ${horizontalDistance}px`);
        
        // Get current section
        const currentSection = this.getCurrentSection();
        console.log(`📍 Current section: ${currentSection}`);
        
        const sections = [
            'dashboard', 'income-expenses', 'inventory-check', 'feed-record',
            'broiler-mortality', 'orders', 'sales-record', 'production',
            'reports', 'profile'
        ];
        
        const currentIndex = sections.indexOf(currentSection);
        console.log(`📌 Current index: ${currentIndex}`);
        
        if (currentIndex === -1) {
            console.log('❌ Current section not found in sections list');
            return;
        }
        
        // Swipe left (negative distance) - next section
        if (horizontalDistance < -this.minSwipeDistance) {
            console.log(`👈 Swipe left detected (${horizontalDistance}px)`);
            
            if (currentIndex < sections.length - 1) {
                const nextSection = sections[currentIndex + 1];
                console.log(`➡️ Navigating to next section: ${nextSection}`);
                this.navigateTo(nextSection);
            } else {
                console.log('⚠️ Already at last section');
                this.showEdgeFeedback('end');
            }
        }
        
        // Swipe right (positive distance) - previous section
        else if (horizontalDistance > this.minSwipeDistance) {
            console.log(`👉 Swipe right detected (${horizontalDistance}px)`);
            
            if (currentIndex > 0) {
                const prevSection = sections[currentIndex - 1];
                console.log(`⬅️ Navigating to previous section: ${prevSection}`);
                this.navigateTo(prevSection);
            } else {
                console.log('⚠️ Already at first section');
                this.showEdgeFeedback('start');
            }
        } else {
            console.log(`⏸️ Swipe distance too small: ${horizontalDistance}px (need >${this.minSwipeDistance}px)`);
        }
    },
    
    getCurrentSection: function() {
        // Try multiple ways to get current section
        if (window.app?.currentSection) {
            return window.app.currentSection;
        }
        
        // Check URL hash
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== '') {
            return hash;
        }
        
        // Check active menu item
        const activeMenuItem = document.querySelector('.nav-item.active');
        if (activeMenuItem && activeMenuItem.dataset.section) {
            return activeMenuItem.dataset.section;
        }
        
        // Default
        return 'dashboard';
    },
    
    navigateTo: function(section) {
        console.log(`🚀 Navigating to ${section}`);
        
        // Try app.showSection first
        if (window.app && typeof window.app.showSection === 'function') {
            console.log('Using app.showSection');
            window.app.showSection(section);
            this.showNavigationFeedback(section);
            return;
        }
        
        // Try FarmModules
        if (window.FarmModules && typeof window.FarmModules.showSection === 'function') {
            console.log('Using FarmModules.showSection');
            window.FarmModules.showSection(section);
            this.showNavigationFeedback(section);
            return;
        }
        
        // Fallback: update hash and dispatch event
        console.log('Using fallback navigation');
        window.location.hash = section;
        
        const event = new CustomEvent('section-change', { 
            detail: { section } 
        });
        window.dispatchEvent(event);
        
        // Update active menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
        
        this.showNavigationFeedback(section);
    },
    
    showNavigationFeedback: function(section) {
        // Visual feedback
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeOut 1s ease-out forwards;
        `;
        indicator.textContent = `→ ${section.replace('-', ' ')}`;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        setTimeout(() => {
            indicator.remove();
            style.remove();
        }, 1000);
    },
    
    showEdgeFeedback: function(edge) {
        const message = edge === 'start' ? 'Already at first section' : 'Already at last section';
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeOut 1s ease-out forwards;
        `;
        indicator.textContent = message;
        document.body.appendChild(indicator);
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]); // Triple buzz for edge
        }
        
        setTimeout(() => indicator.remove(), 1000);
    },
    
    enable: function() {
        this.enabled = true;
        console.log('✅ Swipe navigation enabled');
    },
    
    disable: function() {
        this.enabled = false;
        console.log('⏸️ Swipe navigation disabled');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to fully initialize
    setTimeout(() => {
        SwipeNavigation.init();
        
        // Add test button (remove after testing)
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test Swipe';
        testBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #22c55e;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 30px;
            z-index: 9999;
            font-weight: bold;
        `;
        testBtn.onclick = () => {
            console.log('Current section:', SwipeNavigation.getCurrentSection());
            alert('Check console for swipe debug info. Try swiping now!');
        };
        document.body.appendChild(testBtn);
        
        // Auto-remove test button after 30 seconds
        setTimeout(() => testBtn.remove(), 30000);
    }, 2000);
});

// Make globally available
window.SwipeNavigation = SwipeNavigation;

// Register with FarmModules
if (window.FarmModules) {
    window.FarmModules.registerModule('swipe-navigation', SwipeNavigation);
}
