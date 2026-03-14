// ==================== SIMPLE SWIPE NAVIGATION THAT WORKS ====================
const SwipeNav = {
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    minSwipeDistance: 50,
    enabled: true,
    overlay: null,
    
    init: function() {
        console.log('👆 Creating swipe overlay...');
        
        // Create a semi-transparent overlay for debugging (will be invisible after testing)
        this.overlay = document.createElement('div');
        this.overlay.id = 'swipe-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 0, 0.05); /* Very faint green for debugging */
            z-index: 9999;
            pointer-events: auto; /* Capture all touches */
        `;
        
        document.body.appendChild(this.overlay);
        console.log('✅ Swipe overlay created');
        
        // Touch events on the overlay
        this.overlay.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            console.log(`👉 Touch START at: ${this.touchStartX}, ${this.touchStartY}`);
            
            // Visual feedback
            this.overlay.style.background = 'rgba(0, 255, 0, 0.1)';
        }, { passive: false });
        
        this.overlay.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling while swiping
            const touch = e.touches[0];
            const currentX = touch.clientX;
            const currentY = touch.clientY;
            
            // Show live feedback
            console.log(`🔄 Moving: ${currentX - this.touchStartX}px`);
        }, { passive: false });
        
        this.overlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;
            
            console.log(`👆 Touch END at: ${this.touchEndX}, ${this.touchEndY}`);
            console.log(`📏 Horizontal distance: ${this.touchEndX - this.touchStartX}px`);
            console.log(`📏 Vertical distance: ${Math.abs(this.touchEndY - this.touchStartY)}px`);
            
            // Reset visual
            this.overlay.style.background = 'rgba(0, 255, 0, 0.05)';
            
            this.handleSwipe();
        }, { passive: false });
        
        // Add test button
        this.addTestButton();
        
        console.log('✅ Swipe navigation ready - try swiping anywhere!');
    },
    
    handleSwipe: function() {
        if (!this.enabled) return;
        
        const horizontalDistance = this.touchEndX - this.touchStartX;
        const verticalDistance = Math.abs(this.touchEndY - this.touchStartY);
        
        // Ignore if too much vertical movement
        if (verticalDistance > 100) {
            console.log('❌ Too much vertical movement - scrolling?');
            return;
        }
        
        // Get available sections from your app
        const sections = [
            'dashboard', 'income-expenses', 'inventory-check', 'feed-record',
            'broiler-mortality', 'orders', 'sales-record', 'production',
            'reports', 'profile'
        ];
        
        // Find current section
        let currentSection = 'dashboard';
        if (window.location.hash) {
            currentSection = window.location.hash.replace('#', '');
        } else {
            const activeMenuItem = document.querySelector('.nav-item.active');
            if (activeMenuItem) {
                currentSection = activeMenuItem.dataset.section || 'dashboard';
            }
        }
        
        const currentIndex = sections.indexOf(currentSection);
        console.log(`📍 Current: ${currentSection} (index ${currentIndex})`);
        
        // Swipe left (negative) - next section
        if (horizontalDistance < -this.minSwipeDistance) {
            console.log(`👈 Swipe LEFT: ${horizontalDistance}px`);
            
            if (currentIndex < sections.length - 1) {
                const nextSection = sections[currentIndex + 1];
                this.navigateTo(nextSection);
            } else {
                this.showMessage("Already at last section", "#ef4444");
            }
        }
        
        // Swipe right (positive) - previous section
        else if (horizontalDistance > this.minSwipeDistance) {
            console.log(`👉 Swipe RIGHT: ${horizontalDistance}px`);
            
            if (currentIndex > 0) {
                const prevSection = sections[currentIndex - 1];
                this.navigateTo(prevSection);
            } else {
                this.showMessage("Already at first section", "#ef4444");
            }
        }
    },
    
    navigateTo: function(section) {
        console.log(`🚀 Navigating to: ${section}`);
        
        // Show success message
        this.showMessage(`→ ${section.replace('-', ' ')}`, "#22c55e");
        
        // Try multiple navigation methods
        if (window.app && window.app.showSection) {
            window.app.showSection(section);
        } else if (window.FarmModules && window.FarmModules.showSection) {
            window.FarmModules.showSection(section);
        } else {
            // Fallback: update hash and trigger event
            window.location.hash = section;
            
            // Try to find and click menu item
            const menuItem = document.querySelector(`[data-section="${section}"]`);
            if (menuItem) {
                menuItem.click();
            }
        }
        
        // Vibrate on success
        if (navigator.vibrate) navigator.vibrate(50);
    },
    
    showMessage: function(text, color = "#22c55e") {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${color};
            color: white;
            padding: 15px 30px;
            border-radius: 40px;
            font-weight: bold;
            font-size: 18px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: swipeFade 0.8s ease-out forwards;
        `;
        msg.textContent = text;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 800);
    },
    
    addTestButton: function() {
        const btn = document.createElement('button');
        btn.textContent = 'Test Swipe';
        btn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #22c55e;
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 30px;
            z-index: 10001;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
        `;
        btn.onclick = () => {
            alert('👆 Swipe left or right anywhere on screen!\n\nCheck the console for debug info.');
            console.log('Test button clicked - try swiping now!');
        };
        document.body.appendChild(btn);
        
        // Remove after 1 minute
        setTimeout(() => btn.remove(), 60000);
    },
    
    destroy: function() {
        if (this.overlay) {
            this.overlay.remove();
        }
    }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes swipeFade {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
`;
document.head.appendChild(style);

// Initialize when page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => SwipeNav.init(), 2000);
    });
} else {
    setTimeout(() => SwipeNav.init(), 2000);
}

// Make globally available
window.SwipeNav = SwipeNav;
