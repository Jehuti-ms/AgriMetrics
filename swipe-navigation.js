// ==================== SWIPE NAVIGATION ====================
const SwipeNavigation = {
    touchStartX: 0,
    touchEndX: 0,
    minSwipeDistance: 100, // minimum distance for swipe
    enabled: true,
    
    init: function() {
        console.log('👆 Initializing swipe navigation...');
        
        // Add touch event listeners to the main content area
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        contentArea.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        contentArea.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        // Also add mouse swipe for desktop testing
        let isMouseDown = false;
        contentArea.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            this.touchStartX = e.screenX;
        });
        
        contentArea.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            this.touchEndX = e.screenX;
        });
        
        contentArea.addEventListener('mouseup', () => {
            if (isMouseDown) {
                this.handleSwipe();
                isMouseDown = false;
            }
        });
        
        contentArea.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });
        
        console.log('✅ Swipe navigation initialized');
    },
    
    handleSwipe: function() {
        if (!this.enabled) return;
        
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        // Get current section and available sections
        const currentSection = window.app?.currentSection || 'dashboard';
        const sections = ['dashboard', 'income-expenses', 'inventory-check', 'feed-record', 
                         'broiler-mortality', 'orders', 'sales-record', 'production', 
                         'reports', 'profile'];
        
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex === -1) return;
        
        // Swipe left (negative distance) - go to next section
        if (swipeDistance < -this.minSwipeDistance && currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            console.log(`👆 Swipe left: navigating to ${nextSection}`);
            
            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(50);
            
            // Navigate
            if (window.app?.showSection) {
                window.app.showSection(nextSection);
            } else {
                this.navigateTo(nextSection);
            }
        }
        
        // Swipe right (positive distance) - go to previous section
        else if (swipeDistance > this.minSwipeDistance && currentIndex > 0) {
            const prevSection = sections[currentIndex - 1];
            console.log(`👆 Swipe right: navigating to ${prevSection}`);
            
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);
            
            // Navigate
            if (window.app?.showSection) {
                window.app.showSection(prevSection);
            } else {
                this.navigateTo(prevSection);
            }
        }
    },
    
    navigateTo: function(section) {
        // Fallback navigation if app.showSection isn't available
        console.log(`Navigating to ${section}`);
        
        // Update URL hash
        window.location.hash = section;
        
        // Trigger section change
        const event = new CustomEvent('section-change', { detail: { section } });
        window.dispatchEvent(event);
        
        // Try to update active menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
    },
    
    // Enable/disable swipe
    enable: function() {
        this.enabled = true;
    },
    
    disable: function() {
        this.enabled = false;
    },
    
    // Set minimum swipe distance
    setMinDistance: function(distance) {
        this.minSwipeDistance = distance;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for app to initialize
    setTimeout(() => {
        SwipeNavigation.init();
    }, 1000);
});

// Make globally available
window.SwipeNavigation = SwipeNavigation;

// Enhanced version with edge detection
const EdgeSwipeNavigation = {
    ...SwipeNavigation,
    
    init: function() {
        console.log('👆 Initializing edge swipe navigation...');
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // Detect if touch started near edge
        contentArea.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const edgeThreshold = 30; // pixels from edge
            
            // Check if touch is near left or right edge
            if (touch.clientX < edgeThreshold || touch.clientX > window.innerWidth - edgeThreshold) {
                this.touchStartX = touch.screenX;
                this.isEdgeSwipe = true;
            } else {
                this.isEdgeSwipe = false;
            }
        }, { passive: true });
        
        contentArea.addEventListener('touchmove', (e) => {
            if (!this.isEdgeSwipe) return;
            e.preventDefault(); // Prevent scrolling during edge swipe
        }, { passive: false });
        
        contentArea.addEventListener('touchend', (e) => {
            if (!this.isEdgeSwipe) return;
            
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.isEdgeSwipe = false;
        }, { passive: true });
        
        console.log('✅ Edge swipe navigation initialized');
    }
};

// Register with FarmModules
if (window.FarmModules) {
    window.FarmModules.registerModule('swipe-navigation', SwipeNavigation);
}

// Make global
window.SwipeNavigation = SwipeNavigation;
