// app.js - Updated with better error handling
function initializeApp() {
    console.log('Initializing main app...');
    
    try {
        // Initialize navigation
        initializeNavigation();
        
        // Initialize modules
        if (FarmModules && FarmModules.initializeModules) {
            FarmModules.initializeModules();
        }
        
        // Set current dates
        setCurrentDates();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function initializeNavigation() {
    try {
        const mainNav = document.getElementById('main-nav');
        const contentArea = document.getElementById('content-area');
        
        if (!mainNav || !contentArea) {
            console.log('Navigation elements not found yet');
            return;
        }
        
        // Create navigation
        let navHTML = '<ul>';
        for (const moduleName in FarmModules.modules) {
            const module = FarmModules.modules[moduleName];
            if (module.isAuthModule) continue;
            
            navHTML += `
                <li>
                    <a href="#" class="nav-link" data-target="${moduleName}">
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
            if (module.isAuthModule) continue;
            
            contentHTML += module.template || `<div id="${moduleName}" class="section">${module.name} Content</div>`;
        }
        contentArea.innerHTML = contentHTML;
        
        // Set dashboard as active
        const dashboardSection = document.getElementById('dashboard');
        const dashboardLink = document.querySelector('.nav-link[data-target="dashboard"]');
        if (dashboardSection) dashboardSection.classList.add('active');
        if (dashboardLink) dashboardLink.classList.add('active');
        
        // Add navigation event listeners
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('data-target');
                
                // Update active states
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                
                e.target.classList.add('active');
                const targetSection = document.getElementById(target);
                if (targetSection) targetSection.classList.add('active');
            });
        });
    } catch (error) {
        console.error('Error initializing navigation:', error);
    }
}
   
    // Create content sections
    let contentHTML = '';
    for (const moduleName in FarmModules.modules) {
        const module = FarmModules.modules[moduleName];
        if (module.isAuthModule) continue;
        
        contentHTML += module.template || `<div id="${moduleName}" class="section">${module.name} Content</div>`;
    }
    contentArea.innerHTML = contentHTML;
    
    // Set dashboard as active
    const dashboardSection = document.getElementById('dashboard');
    const dashboardLink = document.querySelector('.nav-link[data-target="dashboard"]');
    if (dashboardSection) dashboardSection.classList.add('active');
    if (dashboardLink) dashboardLink.classList.add('active');
    
   
}

function setCurrentDates() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        return;
    }
    
    // Initialize auth module first
    if (FarmModules.modules.auth) {
        FarmModules.modules.auth.initialize();
    }
    
    // Make initializeApp globally available
    window.initializeApp = initializeApp;
});
