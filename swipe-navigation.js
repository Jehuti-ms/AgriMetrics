// ==================== SWIPE NAVIGATION THAT WORKS ON ALL DEVICES ====================
const SwipeNav = {
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    minSwipeDistance: 30,
    isSwiping: false,
    
    sections: [
        'dashboard', 'income-expenses', 'inventory-check', 'feed-record',
        'broiler-mortality', 'orders', 'sales-record', 'production', 'profile'
    ],
    
    init: function() {
        console.log('👆 Initializing swipe navigation...');
        
        // Listen on the entire document
        document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Also add visual indicator that swipe is active
        this.addVisualHint();
        
        console.log('✅ Swipe navigation active - swipe left/right anywhere on screen');
    },
    
    onTouchStart: function(e) {
        // Don't interfere with interactive elements
        const target = e.target;
        if (target.closest('input') || 
            target.closest('textarea') || 
            target.closest('select') ||
            target.closest('button') ||
            target.closest('.popout-modal') ||
            target.closest('.modal') ||
            target.closest('[contenteditable="true"]')) {
            return;
        }
        
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isSwiping = true;
    },
    
    onTouchMove: function(e) {
        if (!this.isSwiping) return;
        
        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
        
        // If horizontal swipe, prevent vertical scroll
        if (Math.abs(deltaX) > 15 && deltaY < 20) {
            e.preventDefault();
            // Show visual feedback while swiping
            this.showSwipeFeedback(deltaX);
        }
    },
    
    onTouchEnd: function(e) {
        if (!this.isSwiping) return;
        
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);
        
        // Only trigger if horizontal swipe and not too much vertical movement
        if (Math.abs(deltaX) > this.minSwipeDistance && deltaY < 100) {
            this.handleSwipe(deltaX);
        }
        
        this.isSwiping = false;
        this.hideSwipeFeedback();
    },
    
    handleSwipe: function(deltaX) {
        // Get current section from active nav item
        let currentSection = 'dashboard';
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            currentSection = activeNav.getAttribute('data-view') || 'dashboard';
        }
        
        const currentIndex = this.sections.indexOf(currentSection);
        
        // Swipe left (negative delta) - go to next section
        if (deltaX < 0) {
            if (currentIndex < this.sections.length - 1) {
                const nextSection = this.sections[currentIndex + 1];
                this.navigateToSection(nextSection, '→');
            } else {
                this.showToast('📱 Already at last section', '#f59e0b');
            }
        }
        // Swipe right (positive delta) - go to previous section
        else if (deltaX > 0) {
            if (currentIndex > 0) {
                const prevSection = this.sections[currentIndex - 1];
                this.navigateToSection(prevSection, '←');
            } else {
                this.showToast('📱 Already at first section', '#f59e0b');
            }
        }
    },
    
    navigateToSection: function(sectionId, arrow) {
        console.log(`🔄 Swipe navigating to: ${sectionId}`);
        
        // Format section name for display
        const sectionNames = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory',
            'feed-record': 'Feed Records',
            'broiler-mortality': 'Mortality',
            'orders': 'Orders',
            'sales-record': 'Sales',
            'production': 'Production',
            'profile': 'Profile'
        };
        
        const sectionName = sectionNames[sectionId] || sectionId;
        this.showToast(`${arrow} ${sectionName}`, '#22c55e');
        
        // Navigate using app
        if (window.app && typeof window.app.showSection === 'function') {
            window.app.showSection(sectionId);
        } else {
            // Fallback: click the nav item
            const navItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
            if (navItem) {
                navItem.click();
            }
        }
        
        // Haptic feedback for devices that support it
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    },
    
    showSwipeFeedback: function(deltaX) {
        let feedback = document.getElementById('swipe-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'swipe-feedback';
            feedback.style.cssText = `
                position: fixed;
                top: 50%;
                transform: translateY(-50%);
                font-size: 48px;
                z-index: 99999;
                pointer-events: none;
                transition: all 0.1s ease;
                opacity: 0;
                filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
            `;
            document.body.appendChild(feedback);
        }
        
        // Show arrow based on swipe direction
        if (deltaX < 0) {
            feedback.textContent = '👉';
            feedback.style.right = '20px';
            feedback.style.left = 'auto';
        } else {
            feedback.textContent = '👈';
            feedback.style.left = '20px';
            feedback.style.right = 'auto';
        }
        
        feedback.style.opacity = Math.min(Math.abs(deltaX) / 100, 0.8).toString();
    },
    
    hideSwipeFeedback: function() {
        const feedback = document.getElementById('swipe-feedback');
        if (feedback) {
            feedback.style.opacity = '0';
        }
    },
    
    showToast: function(message, color) {
        // Remove existing toast
        const existing = document.getElementById('swipe-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'swipe-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            z-index: 100000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: swipeToastFade 1.2s ease forwards;
            pointer-events: none;
            white-space: nowrap;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 1200);
    },
    
    addVisualHint: function() {
        // Only show once
        if (localStorage.getItem('swipe-hint-shown')) return;
        
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            color: white;
            padding: 10px 20px;
            border-radius: 40px;
            font-size: 13px;
            z-index: 100000;
            display: flex;
            gap: 20px;
            pointer-events: none;
            animation: swipeHintFade 3s ease forwards;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        hint.innerHTML = `
            <span>👈 Swipe left</span>
            <span style="opacity: 0.5">•</span>
            <span>Swipe right 👉</span>
        `;
        document.body.appendChild(hint);
        
        localStorage.setItem('swipe-hint-shown', 'true');
        
        setTimeout(() => hint.remove(), 3000);
    }
};

// Add required CSS animations
if (!document.querySelector('#swipe-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'swipe-nav-styles';
    style.textContent = `
        @keyframes swipeToastFade {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); visibility: hidden; }
        }
        
        @keyframes swipeHintFade {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            70% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-30px); visibility: hidden; }
        }
        
        /* Disable pull-to-refresh while swiping */
        body.swiping {
            overscroll-behavior-x: none;
        }
    `;
    document.head.appendChild(style);
}

// Initialize after page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => SwipeNav.init(), 1000);
    });
} else {
    setTimeout(() => SwipeNav.init(), 1000);
}

window.SwipeNav = SwipeNav;
