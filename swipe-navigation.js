// ==================== SWIPE NAVIGATION ====================
const SwipeNavigation = {
    touchStartX: 0,
    touchEndX: 0,
    minSwipeDistance: 100,
    enabled: true,
    isEdgeSwipe: false,  // ADD THIS
    
    init: function(useEdgeDetection = false) {
        console.log('👆 Initializing swipe navigation...');
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        if (useEdgeDetection) {
            this.initEdgeDetection(contentArea);
        } else {
            this.initStandard(contentArea);
        }
        
        console.log('✅ Swipe navigation initialized');
    },
    
    initStandard: function(contentArea) {
        contentArea.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        contentArea.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        // Mouse support for desktop
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
    },
    
    initEdgeDetection: function(contentArea) {
        contentArea.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const edgeThreshold = 30;
            
            if (touch.clientX < edgeThreshold || touch.clientX > window.innerWidth - edgeThreshold) {
                this.touchStartX = touch.screenX;
                this.isEdgeSwipe = true;
            } else {
                this.isEdgeSwipe = false;
            }
        }, { passive: true });
        
        contentArea.addEventListener('touchmove', (e) => {
            if (!this.isEdgeSwipe) return;
            e.preventDefault();
        }, { passive: false });
        
        contentArea.addEventListener('touchend', (e) => {
            if (!this.isEdgeSwipe) return;
            
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.isEdgeSwipe = false;
        }, { passive: true });
    },
    
    handleSwipe: function() {
        if (!this.enabled) return;
        
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        const currentSection = window.app?.currentSection || 'dashboard';
        const sections = ['dashboard', 'income-expenses', 'inventory-check', 'feed-record', 
                         'broiler-mortality', 'orders', 'sales-record', 'production', 
                         'reports', 'profile'];
        
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex === -1) return;
        
        if (swipeDistance < -this.minSwipeDistance && currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            console.log(`👆 Swipe left: navigating to ${nextSection}`);
            
            if (navigator.vibrate) navigator.vibrate(50);
            
            if (window.app?.showSection) {
                window.app.showSection(nextSection);
            } else {
                this.navigateTo(nextSection);
            }
        }
        else if (swipeDistance > this.minSwipeDistance && currentIndex > 0) {
            const prevSection = sections[currentIndex - 1];
            console.log(`👆 Swipe right: navigating to ${prevSection}`);
            
            if (navigator.vibrate) navigator.vibrate(50);
            
            if (window.app?.showSection) {
                window.app.showSection(prevSection);
            } else {
                this.navigateTo(prevSection);
            }
        }
    },
    
    navigateTo: function(section) {
        console.log(`Navigating to ${section}`);
        window.location.hash = section;
        
        const event = new CustomEvent('section-change', { detail: { section } });
        window.dispatchEvent(event);
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
    },
    
    enable: function() {
        this.enabled = true;
    },
    
    disable: function() {
        this.enabled = false;
    },
    
    setMinDistance: function(distance) {
        this.minSwipeDistance = distance;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Use false for standard swipe, true for edge detection
        SwipeNavigation.init(false);
    }, 1000);
});

// Add visual indicator (optional)
const swipeIndicatorStyles = `
    .swipe-indicator {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(5px);
        border-radius: 30px;
        color: white;
        font-size: 12px;
        z-index: 1000;
        opacity: 0.7;
        transition: opacity 0.3s;
    }
    
    .swipe-indicator.hidden {
        opacity: 0;
    }
    
    .swipe-arrow {
        font-size: 16px;
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(5px); }
    }
`;

// Add styles and indicator
const styleSheet = document.createElement('style');
styleSheet.textContent = swipeIndicatorStyles;
document.head.appendChild(styleSheet);

const swipeIndicator = document.createElement('div');
swipeIndicator.className = 'swipe-indicator';
swipeIndicator.innerHTML = `
    <span>👆 Swipe left/right to navigate</span>
    <span class="swipe-arrow">→</span>
`;
document.body.appendChild(swipeIndicator);

setTimeout(() => {
    swipeIndicator.classList.add('hidden');
}, 5000);

// Register with FarmModules
if (window.FarmModules) {
    window.FarmModules.registerModule('swipe-navigation', SwipeNavigation);
}

// Make globally available
window.SwipeNavigation = SwipeNavigation;
