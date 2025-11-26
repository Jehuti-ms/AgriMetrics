// app.js - SIMPLE VERSION
console.log('🚜 Farm Management PWA - Simple version');

class FarmPWA {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded');
            this.setupServiceWorker();
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/AgriMetrics/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                })
                .catch(error => {
                    console.log('❌ Service Worker failed:', error);
                });
        }
    }
}

window.farmPWA = new FarmPWA();
