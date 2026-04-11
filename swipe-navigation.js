// ==================== SIMPLE SWIPE NAVIGATION THAT WORKS ====================
const SwipeNav = {
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    minSwipeDistance: 50,
    enabled: true,
    
    // Define sections in order (matches your nav items)
    sections: [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'income-expenses', name: 'Income' },
        { id: 'inventory-check', name: 'Inventory' },
        { id: 'feed-record', name: 'Feed' },
        { id: 'broiler-mortality', name: 'Mortality' },
        { id: 'orders', name: 'Orders' },
        { id: 'sales-record', name: 'Sales' },
        { id: 'production', name: 'Production' },
        { id: 'profile', name: 'Profile' }
    ],
    
    init: function() {
        console.log('👆 Initializing swipe navigation...');
        
        // Listen on the content area for better touch detection
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            contentArea.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            contentArea.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        } else {
            // Fallback to body
            document.body.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            document.body.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            document.body.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }
        
        console.log('✅ Swipe navigation ready - swipe left/right on the content area!');
        
        // Add instruction
        this.addInstruction();
    },
    
    handleTouchStart: function(e) {
        // Don't interfere with form inputs or interactive elements
        const target = e.target;
        if (target.closest('input') ||
            target.closest('textarea') ||
            target.closest('select') ||
            target.closest('button') ||
            target.closest('.popout-modal') ||
            target.closest('.glass-card')) {
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
        
        // Find current section index
        let currentIndex = 0;
        
        // Try to get current section from active nav item
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem) {
            const currentView = activeNavItem.getAttribute('data-view');
            currentIndex = this.sections.findIndex(s => s.id === currentView);
        }
        
        // If not found, try from URL or default to 0
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        // Swipe left (negative) - next section
        if (horizontalDistance < -this.minSwipeDistance) {
            if (currentIndex < this.sections.length - 1) {
                this.navigateTo(this.sections[currentIndex + 1].id, 'next');
            } else {
                this.showToast("Already at last section", "#ef4444");
            }
        }
        
        // Swipe right (positive) - previous section
        else if (horizontalDistance > this.minSwipeDistance) {
            if (currentIndex > 0) {
                this.navigateTo(this.sections[currentIndex - 1].id, 'prev');
            } else {
                this.showToast("Already at first section", "#ef4444");
            }
        }
    },
    
    navigateTo: function(sectionId, direction) {
        console.log(`🚀 Navigating to: ${sectionId}`);
        
        const section = this.sections.find(s => s.id === sectionId);
        const directionArrow = direction === 'next' ? '→' : '←';
        this.showToast(`${directionArrow} ${section?.name || sectionId}`, "#22c55e");
        
        // Navigate using app
        if (window.app && typeof window.app.showSection === 'function') {
            window.app.showSection(sectionId);
        } else {
            // Fallback: find and click nav item
            const navItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
            if (navItem) {
                navItem.click();
            }
        }
        
        // Haptic feedback for mobile
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
            white-space: nowrap;
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
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 14px;
            z-index: 10000;
            display: flex;
            gap: 30px;
            pointer-events: none;
            animation: swipeFade 3s ease-out forwards;
            font-weight: 500;
        `;
        instruction.innerHTML = `
            <span>👈 Swipe left for next</span>
            <span style="opacity: 0.5">|</span>
            <span>Swipe right for previous 👉</span>
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
        
        /* Prevent scroll while swiping */
        .swiping {
            overflow: hidden;
            touch-action: pan-y pinch-zoom;
        }
    `;
    document.head.appendChild(style);
}

// Initialize after app is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => SwipeNav.init(), 1500);
    });
} else {
    setTimeout(() => SwipeNav.init(), 1500);
}

window.SwipeNav = SwipeNav;
