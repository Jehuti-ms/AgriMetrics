// ==================== MAIN APPLICATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize PWA features
    initializePWA();
    
    // Load data from storage
    FarmModules.loadDataFromStorage();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize all modules
    FarmModules.initializeModules();
    
    // Set current date for date fields
    setCurrentDates();
});

// PWA Initialization
function initializePWA() {
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const dismissInstall = document.getElementById('dismissInstall');
    const offlineIndicator = document.getElementById('offlineIndicator');

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    }

    // Online/Offline Detection
    window.addEventListener('online', function() {
        offlineIndicator.classList.remove('show');
        console.log('App is online');
    });

    window.addEventListener('offline', function() {
        offlineIndicator.classList.add('show');
        console.log('App is offline');
    });

    // Install Prompt Handling
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(showInstallPrompt, 3000);
    });

    function showInstallPrompt() {
        if (deferredPrompt) {
            installPrompt.classList.add('show');
        }
    }

    function hideInstallPrompt() {
        installPrompt.classList.remove('show');
    }

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            hideInstallPrompt();
        }
    });

    dismissInstall.addEventListener('click', hideInstallPrompt);
}

// Navigation Initialization
function initializeNavigation() {
    const mainNav = document.getElementById('main-nav');
    const contentArea = document.getElementById('content-area');
    
    // Create navigation
    let navHTML = '<ul>';
    for (const moduleName in FarmModules.modules) {
        const module = FarmModules.modules[moduleName];
        navHTML += `
            <li>
                <a href="#" class="nav-link ${moduleName === 'dashboard' ? 'active' : ''}" 
                   data-target="${moduleName}">
                   ${module.icon || '📄'} ${module.name}
                </a>
            </li>
        `;
    }
    navHTML += '</ul>';
    mainNav.innerHTML = navHTML;
    
    // Create content sections
    let contentHTML = '';
    for (const moduleName in FarmModules.modules) {
        const module = FarmModules.modules[moduleName];
        contentHTML += module.template || `<div id="${moduleName}" class="section ${moduleName === 'dashboard' ? 'active' : ''}"><h1>${module.name}</h1><p>Content for ${module.name}</p></div>`;
    }
    contentArea.innerHTML = contentHTML;
    
    // Attach navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            FarmModules.navigateTo(target);
        });
    });
    
    // Initialize sidebar for dashboard
    FarmModules.updateSidebar('dashboard');
}

// Set current dates in date fields
function setCurrentDates() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.id.includes('start-date') && !input.id.includes('planting-date')) {
            input.value = today;
        }
    });
}
