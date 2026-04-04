// ==================== SIMPLE SWIPE NAVIGATION THAT WORKS ====================
const SwipeNav = {
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    minSwipeDistance: 50,
    enabled: true,
    
    init: function() {
        console.log('👆 Initializing swipe navigation...');
        
        // Listen on document body instead of creating overlay
        document.body.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.body.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.body.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        console.log('✅ Swipe navigation ready - swipe left/right on the screen!');
        
        // Add visual indicator on first swipe
        this.addInstruction();
    },
    
    handleTouchStart: function(e) {
        // Don't interfere with menu or form inputs
        const target = e.target;
        if (target.closest('.menu-overlay') || 
            target.closest('.hamburger-menu') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('select') ||
            target.closest('button')) {
            this.enabled = false;
            return;
        }
        
        this.enabled = true;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    },
    
    handleTouchMove: function(e) {
        if (!this.enabled) return;
        
        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
        
        // If swiping horizontally, prevent page scroll
        if (Math.abs(deltaX) > 10 && deltaY < 30) {
            e.preventDefault();
        }
    },
    
    handleTouchEnd: function(e) {
        if (!this.enabled) return;
        
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        const horizontalDistance = this.touchEndX - this.touchStartX;
        const verticalDistance = Math.abs(this.touchEndY - this.touchStartY);
        
        // Ignore if too much vertical movement
        if (verticalDistance > 100) {
            return;
        }
        
        // Get available sections
        const sections = [
            'dashboard', 'income-expenses', 'inventory-check', 'feed-record',
            'broiler-mortality', 'orders', 'sales-record', 'production',
            'reports', 'profile'
        ];
        
        // Find current section
        let currentSection = 'dashboard';
        const activeMenuItem = document.querySelector('.nav-item.active');
        if (activeMenuItem) {
            currentSection = activeMenuItem.dataset.section || 'dashboard';
        }
        
        const currentIndex = sections.indexOf(currentSection);
        
        // Swipe left (negative) - next section
        if (horizontalDistance < -this.minSwipeDistance) {
            if (currentIndex < sections.length - 1) {
                this.navigateTo(sections[currentIndex + 1], 'next');
            } else {
                this.showToast("Already at last section", "#ef4444");
            }
        }
        
        // Swipe right (positive) - previous section
        else if (horizontalDistance > this.minSwipeDistance) {
            if (currentIndex > 0) {
                this.navigateTo(sections[currentIndex - 1], 'prev');
            } else {
                this.showToast("Already at first section", "#ef4444");
            }
        }
    },
    
    navigateTo: function(section, direction) {
        console.log(`🚀 Navigating to: ${section}`);
        
        const directionText = direction === 'next' ? '→' : '←';
        this.showToast(`${directionText} ${section.replace('-', ' ')}`, "#22c55e");
        
        // Navigate
        if (window.app && typeof window.app.showSection === 'function') {
            window.app.showSection(section);
        } else {
            // Fallback: click menu item
            const menuItem = document.querySelector(`[data-section="${section}"]`);
            if (menuItem) {
                menuItem.click();
            }
        }
        
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(30);
    },
    
    showToast: function(message, color) {
        // Remove existing toast
        const existing = document.querySelector('.swipe-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'swipe-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-weight: bold;
            font-size: 16px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: swipeFade 0.8s ease-out forwards;
            pointer-events: none;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 800);
    },
    
    addInstruction: function() {
        // Only show once
        if (localStorage.getItem('swipe-instruction-shown')) return;
        
        const instruction = document.createElement('div');
        instruction.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 14px;
            z-index: 10000;
            display: flex;
            gap: 20px;
            pointer-events: none;
            animation: swipeFade 3s ease-out forwards;
        `;
        instruction.innerHTML = `
            <span>👈 Swipe left</span>
            <span>👉 Swipe right</span>
        `;
        document.body.appendChild(instruction);
        
        localStorage.setItem('swipe-instruction-shown', 'true');
        
        setTimeout(() => instruction.remove(), 3000);
    }
};

// Add animation styles if not present
if (!document.querySelector('#swipe-styles')) {
    const style = document.createElement('style');
    style.id = 'swipe-styles';
    style.textContent = `
        @keyframes swipeFade {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            70% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize after page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => SwipeNav.init(), 1000);
    });
} else {
    setTimeout(() => SwipeNav.init(), 1000);
}

window.SwipeNav = SwipeNav;
