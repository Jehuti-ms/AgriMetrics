// profile.js - Complete Profile Module with All Utilities
console.log('👤 Loading complete profile module with all utilities...');

// ============================================
// 🎯 MODULE CONFIGURATION & CONSTANTS
// ============================================
const PROFILE_CONFIG = {
    STORAGE_KEYS: {
        PROFILE: 'farm-profile',
        USER_PROFILE: 'farm-user-profile',
        CURRENT_USER: 'farm-current-user',
        SESSION: 'farm-session',
        PREFERENCES: 'farm-user-preferences',
        BACKUP: 'farm-profile-backup'
    },
    DEFAULTS: {
        FARM_NAME: 'My Farm',
        FARMER_NAME: 'Farmer',
        FARM_TYPE: 'mixed',
        CURRENCY: 'USD',
        LOW_STOCK_THRESHOLD: 10,
        THEME: 'auto',
        AUTO_SYNC: true,
        LOCAL_STORAGE: true
    },
    THEMES: ['auto', 'light', 'dark', 'green'],
    FARM_TYPES: [
        { value: 'poultry', label: 'Poultry', icon: '🥚' },
        { value: 'dairy', label: 'Dairy', icon: '🥛' },
        { value: 'crops', label: 'Crops', icon: '🌾' },
        { value: 'mixed', label: 'Mixed Farming', icon: '🏡' },
        { value: 'livestock', label: 'Livestock', icon: '🐄' },
        { value: 'aquaculture', label: 'Aquaculture', icon: '🐟' }
    ],
    CURRENCIES: [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'BBD', symbol: '$', name: 'Barbadian Dollar' },
        { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' }
    ]
};

// ============================================
// 🎯 MODULE STATE & GLOBALS
// ============================================
let moduleState = {
    isInitialized: false,
    currentUser: null,
    profileData: null,
    sessionData: null,
    preferences: null,
    saveLock: false,
    autoSaveTimeout: null,
    eventListeners: [],
    broadcastSubscriptions: []
};

// ============================================
// 🎯 CORE PROFILE CLASS
// ============================================
class ProfileManager {
    constructor() {
        this.initialized = false;
        this.user = null;
        this.data = null;
    }

    // Initialize profile system
    async init() {
        if (this.initialized) {
            console.log('⚠️ Profile already initialized');
            return true;
        }

        console.log('🚀 Initializing Profile Manager...');
        
        try {
            // 1. Load current user
            await this.loadCurrentUser();
            
            // 2. Load profile data
            await this.loadProfileData();
            
            // 3. Load session data
            await this.loadSessionData();
            
            // 4. Load preferences
            await this.loadPreferences();
            
            // 5. Setup auto-save
            this.setupAutoSave();
            
            // 6. Setup session monitoring
            this.setupSessionMonitor();
            
            // 7. Register event handlers
            this.registerEventHandlers();
            
            this.initialized = true;
            console.log('✅ Profile Manager initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Profile initialization failed:', error);
            return false;
        }
    }

    // Load current user from Firebase or localStorage
    async loadCurrentUser() {
        console.log('👤 Loading current user...');
        
        // Try Firebase auth first
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const auth = firebase.auth();
                if (auth.currentUser) {
                    this.user = auth.currentUser;
                    console.log('✅ User from Firebase:', this.user.email);
                    
                    // Store user info in localStorage for persistence
                    localStorage.setItem(PROFILE_CONFIG.STORAGE_KEYS.CURRENT_USER, 
                        JSON.stringify({
                            uid: this.user.uid,
                            email: this.user.email,
                            displayName: this.user.displayName,
                            photoURL: this.user.photoURL,
                            lastLogin: new Date().toISOString()
                        })
                    );
                    
                    return this.user;
                }
                
                // Wait for auth state if not immediately available
                return new Promise((resolve) => {
                    const unsubscribe = auth.onAuthStateChanged((user) => {
                        unsubscribe();
                        this.user = user;
                        if (user) {
                            console.log('✅ Firebase auth state resolved:', user.email);
                            resolve(user);
                        } else {
                            console.log('⚠️ No Firebase user, checking localStorage...');
                            resolve(this.loadUserFromStorage());
                        }
                    });
                });
            } catch (error) {
                console.warn('⚠️ Firebase auth error:', error);
                return this.loadUserFromStorage();
            }
        } else {
            return this.loadUserFromStorage();
        }
    }

    // Load user from localStorage fallback
    loadUserFromStorage() {
        const userData = localStorage.getItem(PROFILE_CONFIG.STORAGE_KEYS.CURRENT_USER);
        if (userData) {
            try {
                this.user = JSON.parse(userData);
                console.log('✅ User from localStorage:', this.user.email);
                return this.user;
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
            }
        }
        
        console.log('⚠️ No user found in storage');
        return null;
    }

    // Load profile data
    async loadProfileData() {
        console.log('📂 Loading profile data...');
        
        const userId = this.user?.uid || this.user?.email || 'default';
        const storageKey = `${PROFILE_CONFIG.STORAGE_KEYS.USER_PROFILE}-${userId}`;
        
        // Try user-specific storage first
        let profileData = localStorage.getItem(storageKey);
        
        if (!profileData) {
            // Fallback to general profile storage
            profileData = localStorage.getItem(PROFILE_CONFIG.STORAGE_KEYS.PROFILE);
        }
        
        if (profileData) {
            try {
                this.data = JSON.parse(profileData);
                console.log('📊 Loaded existing profile:', this.data.farmName);
                
                // Migrate data if needed
                this.migrateProfileData();
                
                return this.data;
            } catch (error) {
                console.error('❌ Error parsing profile data:', error);
            }
        }
        
        // Create default profile
        console.log('🆕 Creating new profile data');
        this.data = this.createDefaultProfile();
        await this.saveProfileData();
        
        return this.data;
    }

    // Create default profile
    createDefaultProfile() {
        return {
            farmName: PROFILE_CONFIG.DEFAULTS.FARM_NAME,
            farmerName: this.user?.displayName || PROFILE_CONFIG.DEFAULTS.FARMER_NAME,
            email: this.user?.email || '',
            farmType: PROFILE_CONFIG.DEFAULTS.FARM_TYPE,
            farmLocation: '',
            currency: PROFILE_CONFIG.DEFAULTS.CURRENCY,
            lowStockThreshold: PROFILE_CONFIG.DEFAULTS.LOW_STOCK_THRESHOLD,
            autoSync: PROFILE_CONFIG.DEFAULTS.AUTO_SYNC,
            localStorageEnabled: PROFILE_CONFIG.DEFAULTS.LOCAL_STORAGE,
            theme: PROFILE_CONFIG.DEFAULTS.THEME,
            memberSince: new Date().toISOString(),
            rememberUser: true,
            lastUpdated: new Date().toISOString(),
            version: '2.0.0',
            settings: {
                notifications: true,
                emailReports: false,
                weeklySummary: true,
                backupFrequency: 'daily'
            }
        };
    }

    // Migrate old profile data
    migrateProfileData() {
        if (!this.data.version) {
            console.log('🔄 Migrating legacy profile data...');
            
            // Add version
            this.data.version = '2.0.0';
            
            // Ensure all required fields exist
            const defaults = this.createDefaultProfile();
            for (const key in defaults) {
                if (this.data[key] === undefined) {
                    this.data[key] = defaults[key];
                }
            }
            
            // Save migrated data
            this.saveProfileData();
        }
    }

    // Load session data
    async loadSessionData() {
        console.log('📊 Loading session data...');
        
        const sessionData = localStorage.getItem(PROFILE_CONFIG.STORAGE_KEYS.SESSION);
        if (sessionData) {
            try {
                moduleState.sessionData = JSON.parse(sessionData);
                console.log('✅ Session data loaded');
            } catch (error) {
                console.error('❌ Error parsing session data:', error);
                moduleState.sessionData = this.createDefaultSession();
            }
        } else {
            moduleState.sessionData = this.createDefaultSession();
        }
        
        return moduleState.sessionData;
    }

    // Create default session
    createDefaultSession() {
        return {
            sessionStart: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            pageViews: 0,
            moduleUsage: {},
            darkMode: false,
            notificationsEnabled: true
        };
    }

    // Load user preferences
    async loadPreferences() {
        console.log('⚙️ Loading user preferences...');
        
        const prefsData = localStorage.getItem(PROFILE_CONFIG.STORAGE_KEYS.PREFERENCES);
        if (prefsData) {
            try {
                moduleState.preferences = JSON.parse(prefsData);
                console.log('✅ Preferences loaded');
            } catch (error) {
                console.error('❌ Error parsing preferences:', error);
                moduleState.preferences = this.createDefaultPreferences();
            }
        } else {
            moduleState.preferences = this.createDefaultPreferences();
        }
        
        return moduleState.preferences;
    }

    // Create default preferences
    createDefaultPreferences() {
        return {
            theme: 'auto',
            businessName: 'My Farm',
            businessType: 'poultry',
            dashboardLayout: 'grid',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD',
            notifications: {
                email: true,
                browser: true,
                sounds: false
            }
        };
    }

    // Save profile data
    async saveProfileData(force = false) {
        if (moduleState.saveLock && !force) {
            console.warn('🚫 Save blocked - lock is active');
            return false;
        }
        
        moduleState.saveLock = true;
        console.log('💾 Starting profile save...');
        
        try {
            // Get current form data
            const formData = this.getFormData();
            
            // Merge with existing data
            const userId = this.user?.uid || this.user?.email || 'default';
            const storageKey = `${PROFILE_CONFIG.STORAGE_KEYS.USER_PROFILE}-${userId}`;
            
            // Update profile data
            this.data = {
                ...this.data,
                ...formData,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to localStorage (primary)
            localStorage.setItem(storageKey, JSON.stringify(this.data));
            
            // Also save to general profile for backward compatibility
            localStorage.setItem(PROFILE_CONFIG.STORAGE_KEYS.PROFILE, JSON.stringify(this.data));
            
            // Create backup
            this.createBackup();
            
            // Update session
            this.updateSession('profile_saved');
            
            // Update UI
            this.updateProfileCard();
            
            // Broadcast update
            this.broadcastProfileUpdate();
            
            // Show success
            this.showMessage('Profile saved successfully!', 'success');
            
            console.log('✅ Profile saved successfully:', this.data.farmName);
            return true;
            
        } catch (error) {
            console.error('❌ Profile save error:', error);
            this.showMessage('Error saving profile: ' + error.message, 'error');
            return false;
            
        } finally {
            moduleState.saveLock = false;
            console.log('🔓 Save lock released');
        }
    }

    // Get form data
    getFormData() {
        const formData = {};
        
        // Farm name - handle duplicate IDs
        const farmNameInput = document.querySelector('input[name="farm-name"]') || 
                             document.querySelector('#farm-name:not(#farm-name-dup-*)');
        
        if (farmNameInput) {
            formData.farmName = farmNameInput.value.trim();
            console.log('🏷️ Farm name from form:', formData.farmName);
        }
        
        // Other form fields
        const formFields = [
            { key: 'farmerName', selector: '#farmer-name, input[name="farmer-name"]' },
            { key: 'email', selector: '#farm-email, input[name="farm-email"]' },
            { key: 'farmType', selector: '#farm-type, select[name="farm-type"]' },
            { key: 'farmLocation', selector: '#farm-location, input[name="farm-location"]' },
            { key: 'currency', selector: '#default-currency, select[name="currency"]' },
            { key: 'lowStockThreshold', selector: '#low-stock-threshold', type: 'number' },
            { key: 'autoSync', selector: '#auto-sync', type: 'checkbox' },
            { key: 'localStorageEnabled', selector: '#local-storage', type: 'checkbox' },
            { key: 'theme', selector: '#theme-selector, select[name="theme"]' }
        ];
        
        formFields.forEach(field => {
            const element = document.querySelector(field.selector);
            if (element) {
                if (field.type === 'checkbox') {
                    formData[field.key] = element.checked;
                } else if (field.type === 'number') {
                    formData[field.key] = parseInt(element.value) || 0;
                } else {
                    formData[field.key] = element.value.trim();
                }
            }
        });
        
        return formData;
    }

    // Update profile card display
    updateProfileCard(farmName = null) {
        const displayName = farmName || this.data?.farmName;
        
        if (!displayName || displayName === 'undefined') {
            console.warn('⚠️ Invalid farm name for card update:', displayName);
            return;
        }
        
        console.log('🎨 Updating profile card with:', displayName);
        
        // Update all profile card displays
        const cardSelectors = [
            '#profile-farm-name',
            '.profile-farm-name',
            '.farm-name-display',
            '[data-profile-farm-name]',
            '.profile-header h2'
        ];
        
        cardSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.textContent !== displayName) {
                    element.textContent = displayName;
                    console.log('✅ Updated card element:', selector);
                }
            });
        });
        
        // Update any dashboard displays
        const dashboardElements = document.querySelectorAll('.dashboard-farm-name, [data-dashboard-title]');
        dashboardElements.forEach(element => {
            if (element.textContent.includes('Farm') || element.dataset.dashboardTitle) {
                element.textContent = displayName;
            }
        });
    }

    // Broadcast profile update
    broadcastProfileUpdate() {
        console.log('📢 Broadcasting profile update...');
        
        // Custom event
        const profileEvent = new CustomEvent('farm-profile-updated', {
            detail: {
                farmName: this.data.farmName,
                farmerName: this.data.farmerName,
                profileData: this.data,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(profileEvent);
        
        // DataBroadcaster
        if (window.DataBroadcaster) {
            DataBroadcaster.broadcast('profile:updated', this.data);
        }
        
        // FarmModules
        if (window.FarmModules && FarmModules.broadcast) {
            FarmModules.broadcast('profile:updated', this.data);
        }
        
        // StyleManager for theme changes
        if (window.StyleManager && this.data.theme) {
            StyleManager.applyTheme(this.data.theme);
        }
    }

    // Update session
    updateSession(action) {
        if (!moduleState.sessionData) return;
        
        moduleState.sessionData.lastActivity = new Date().toISOString();
        
        if (action) {
            if (!moduleState.sessionData.moduleUsage[action]) {
                moduleState.sessionData.moduleUsage[action] = 0;
            }
            moduleState.sessionData.moduleUsage[action]++;
        }
        
        // Save session
        localStorage.setItem(PROFILE_CONFIG.STORAGE_KEYS.SESSION, 
            JSON.stringify(moduleState.sessionData));
    }

    // Create backup
    createBackup() {
        try {
            const backup = {
                profile: this.data,
                timestamp: new Date().toISOString(),
                user: this.user?.email || 'unknown'
            };
            
            localStorage.setItem(PROFILE_CONFIG.STORAGE_KEYS.BACKUP, JSON.stringify(backup));
            console.log('💾 Created profile backup');
        } catch (error) {
            console.error('❌ Backup creation failed:', error);
        }
    }

    // Setup auto-save
    setupAutoSave() {
        console.log('⏱️ Setting up auto-save...');
        
        const formElements = document.querySelectorAll('#profile-section input, #profile-section select, #profile-section textarea');
        
        formElements.forEach(element => {
            element.addEventListener('input', () => {
                clearTimeout(moduleState.autoSaveTimeout);
                moduleState.autoSaveTimeout = setTimeout(() => {
                    console.log('🤖 Auto-saving profile...');
                    this.saveProfileData();
                }, 3000);
            });
        });
    }

    // Setup session monitor
    setupSessionMonitor() {
        console.log('👁️ Setting up session monitor...');
        
        // Update session on user activity
        const activities = ['click', 'keypress', 'scroll', 'mousemove'];
        activities.forEach(activity => {
            document.addEventListener(activity, () => {
                this.updateSession('user_activity');
            }, { passive: true });
        });
        
        // Save session before page unload
        window.addEventListener('beforeunload', () => {
            this.updateSession('page_unload');
        });
    }

    // Register event handlers
    registerEventHandlers() {
        console.log('🔧 Registering event handlers...');
        
        // Save button
        const saveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('💾 Manual save triggered');
            this.saveProfileData();
        };
        
        const saveButton = document.querySelector('.save-profile-btn, #save-profile, button[type="submit"]');
        if (saveButton) {
            saveButton.addEventListener('click', saveHandler);
            moduleState.eventListeners.push({ element: saveButton, event: 'click', handler: saveHandler });
        }
        
        // Logout button
        const logoutHandler = (e) => {
            e.preventDefault();
            this.logout();
        };
        
        const logoutButton = document.getElementById('logout-btn') || 
                            document.querySelector('.logout-btn, [data-logout]');
        if (logoutButton) {
            logoutButton.addEventListener('click', logoutHandler);
            moduleState.eventListeners.push({ element: logoutButton, event: 'click', handler: logoutHandler });
        } else {
            this.createLogoutButton();
        }
        
        // Form submission
        const profileForm = document.querySelector('#profile-form, #profile-section form');
        if (profileForm) {
            profileForm.addEventListener('submit', saveHandler);
            moduleState.eventListeners.push({ element: profileForm, event: 'submit', handler: saveHandler });
        }
        
        // Theme selector
        const themeHandler = () => {
            console.log('🎨 Theme changed, saving...');
            this.saveProfileData();
        };
        
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', themeHandler);
            moduleState.eventListeners.push({ element: themeSelector, event: 'change', handler: themeHandler });
        }
    }

    // Create logout button
    createLogoutButton() {
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;
        
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'btn btn-danger logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Log Out';
        logoutBtn.style.cssText = `
            margin-top: 20px;
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border-radius: 8px;
        `;
        
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        const formActions = profileSection.querySelector('.form-actions') || 
                           profileSection.querySelector('form') || 
                           profileSection;
        
        formActions.appendChild(logoutBtn);
        console.log('✅ Created logout button');
    }

    // Logout user
    async logout() {
        if (!confirm('Are you sure you want to log out?')) {
            return;
        }
        
        console.log('🚪 Starting logout process...');
        
        try {
            // Update session
            this.updateSession('logout');
            
            // Firebase logout
            if (typeof firebase !== 'undefined' && firebase.auth().signOut) {
                await firebase.auth().signOut();
                console.log('✅ Firebase logout successful');
            }
            
            // Clear session data
            localStorage.removeItem(PROFILE_CONFIG.STORAGE_KEYS.SESSION);
            localStorage.removeItem(PROFILE_CONFIG.STORAGE_KEYS.CURRENT_USER);
            
            // Keep profile data for next login
            // localStorage.removeItem(PROFILE_CONFIG.STORAGE_KEYS.PROFILE);
            
            // Redirect or reload
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            window.location.reload();
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        console.log(type === 'error' ? '❌' : '✅', message);
        
        // Remove existing messages
        document.querySelectorAll('.profile-message').forEach(msg => msg.remove());
        
        // Create message
        const messageDiv = document.createElement('div');
        messageDiv.className = `profile-message ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        messageDiv.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        // Style based on type
        const styles = {
            success: {
                background: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb'
            },
            error: {
                background: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb'
            },
            info: {
                background: '#d1ecf1',
                color: '#0c5460',
                border: '1px solid #bee5eb'
            }
        };
        
        const style = styles[type] || styles.info;
        Object.assign(messageDiv.style, {
            ...style,
            padding: '12px',
            borderRadius: '4px',
            margin: '10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s'
        });
        
        // Add to profile section
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
            profileSection.insertBefore(messageDiv, profileSection.firstChild);
            
            // Auto-remove
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.opacity = '0';
                    messageDiv.style.transition = 'opacity 0.3s';
                    setTimeout(() => messageDiv.remove(), 300);
                }
            }, type === 'error' ? 5000 : 3000);
        }
    }

    // ============================================
    // 🎯 PUBLIC API METHODS
    // ============================================
    
    // Get current profile data
    getProfile() {
        return this.data;
    }
    
    // Get current user
    getUser() {
        return this.user;
    }
    
    // Get session data
    getSession() {
        return moduleState.sessionData;
    }
    
    // Get preferences
    getPreferences() {
        return moduleState.preferences;
    }
    
    // Update farm name (programmatically)
    updateFarmName(farmName) {
        if (!farmName || farmName.trim() === '') {
            console.error('❌ Invalid farm name');
            return false;
        }
        
        this.data.farmName = farmName.trim();
        this.updateProfileCard(farmName.trim());
        this.saveProfileData(true); // Force save
        return true;
    }
    
    // Export profile data
    exportProfile(format = 'json') {
        const exportData = {
            profile: this.data,
            session: moduleState.sessionData,
            preferences: moduleState.preferences,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            // Simple CSV export
            let csv = 'Field,Value\n';
            for (const [key, value] of Object.entries(this.data)) {
                csv += `${key},"${value}"\n`;
            }
            return csv;
        }
        
        return null;
    }
    
    // Import profile data
    importProfile(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (parsed.profile) {
                this.data = { ...this.data, ...parsed.profile };
                this.saveProfileData(true);
                this.showMessage('Profile imported successfully!', 'success');
                return true;
            }
            
            throw new Error('Invalid profile data format');
            
        } catch (error) {
            console.error('❌ Import error:', error);
            this.showMessage('Failed to import profile: ' + error.message, 'error');
            return false;
        }
    }
    
    // Reset profile to defaults
    resetProfile() {
        if (confirm('Are you sure you want to reset your profile to defaults?')) {
            this.data = this.createDefaultProfile();
            this.saveProfileData(true);
            this.showMessage('Profile reset to defaults', 'info');
            return true;
        }
        return false;
    }
}

// ============================================
// 🎯 MODULE INITIALIZATION
// ============================================

// Create global instance
const Profile = new ProfileManager();

// Initialize when DOM is ready
function initializeProfileModule() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('📄 DOM ready, initializing profile...');
            await Profile.init();
        });
    } else {
        console.log('⚡ DOM already ready, initializing profile...');
        setTimeout(async () => {
            await Profile.init();
        }, 100);
    }
}

// ============================================
// 🎯 MODULE RENDER FUNCTION
// ============================================
function renderProfile() {
    const profileData = Profile.getProfile() || {};
    const user = Profile.getUser();
    
    if (!user) {
        return `
            <div class="profile-error">
                <div class="error-icon">👤</div>
                <h3>Not Signed In</h3>
                <p>Please sign in to view and edit your profile.</p>
                <button class="btn btn-primary" onclick="window.location.hash='#auth'">
                    Sign In
                </button>
            </div>
        `;
    }
    
    // Render profile form
    return `
        <div class="profile-module">
            <div class="profile-header">
                <h2 id="profile-farm-name">${profileData.farmName || 'My Farm'}</h2>
                <div class="profile-subtitle">
                    <span class="user-email">${user.email || ''}</span>
                    <span class="member-since">
                        <i class="far fa-calendar-alt"></i>
                        Member since: ${profileData.memberSince ? new Date(profileData.memberSince).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
            </div>
            
            <div class="profile-content">
                <form id="profile-form">
                    <!-- Farm Information -->
                    <section class="form-section card">
                        <h3><i class="fas fa-tractor"></i> Farm Information</h3>
                        
                        <div class="form-group">
                            <label for="farm-name">Farm Name *</label>
                            <input type="text" 
                                   id="farm-name" 
                                   name="farm-name" 
                                   class="form-input" 
                                   required 
                                   placeholder="Enter farm name"
                                   value="${profileData.farmName || ''}">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="farmer-name">Farmer Name *</label>
                                <input type="text" 
                                       id="farmer-name" 
                                       name="farmer-name" 
                                       class="form-input" 
                                       required 
                                       placeholder="Enter your name"
                                       value="${profileData.farmerName || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="farm-email">Farm Email</label>
                                <input type="email" 
                                       id="farm-email" 
                                       name="farm-email" 
                                       class="form-input" 
                                       placeholder="farm@example.com"
                                       value="${profileData.email || ''}">
                            </div>
                        </div>
                    </section>
                    
                    <!-- Farm Details -->
                    <section class="form-section card">
                        <h3><i class="fas fa-map-marker-alt"></i> Farm Details</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="farm-type">Farm Type</label>
                                <select id="farm-type" name="farm-type" class="form-input">
                                    ${PROFILE_CONFIG.FARM_TYPES.map(type => `
                                        <option value="${type.value}" ${profileData.farmType === type.value ? 'selected' : ''}>
                                            ${type.icon} ${type.label}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="farm-location">Farm Location</label>
                                <input type="text" 
                                       id="farm-location" 
                                       name="farm-location" 
                                       class="form-input" 
                                       placeholder="e.g., City, State"
                                       value="${profileData.farmLocation || ''}">
                            </div>
                        </div>
                    </section>
                    
                    <!-- Settings -->
                    <section class="form-section card">
                        <h3><i class="fas fa-cog"></i> Settings</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="default-currency">Default Currency</label>
                                <select id="default-currency" name="currency" class="form-input">
                                    ${PROFILE_CONFIG.CURRENCIES.map(currency => `
                                        <option value="${currency.code}" ${profileData.currency === currency.code ? 'selected' : ''}>
                                            ${currency.symbol} ${currency.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="low-stock-threshold">Low Stock Alert</label>
                                <input type="number" 
                                       id="low-stock-threshold" 
                                       name="low-stock-threshold" 
                                       class="form-input" 
                                       min="1" 
                                       max="100"
                                       value="${profileData.lowStockThreshold || 10}">
                                <small class="form-help">Get alerts when stock falls below this level</small>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" 
                                           id="auto-sync" 
                                           name="auto-sync" 
                                           ${profileData.autoSync ? 'checked' : ''}>
                                    <span>Enable Auto Sync</span>
                                </label>
                                <small class="form-help">Automatically sync data between devices</small>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" 
                                           id="local-storage" 
                                           name="local-storage" 
                                           ${profileData.localStorageEnabled ? 'checked' : ''}>
                                    <span>Enable Local Storage</span>
                                </label>
                                <small class="form-help">Store data locally for offline use</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="theme-selector">Theme</label>
                            <select id="theme-selector" name="theme" class="form-input">
                                ${PROFILE_CONFIG.THEMES.map(theme => `
                                    <option value="${theme}" ${profileData.theme === theme ? 'selected' : ''}>
                                        ${theme.charAt(0).toUpperCase() + theme.slice(1)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </section>
                    
                    <!-- Actions -->
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary save-profile-btn">
                            <i class="fas fa-save"></i> Save Profile
                        </button>
                        <button type="button" id="logout-btn" class="btn btn-danger logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Log Out
                        </button>
                    </div>
                    
                    <!-- Profile Stats -->
                    <div class="profile-stats card">
                        <h4><i class="fas fa-chart-line"></i> Profile Statistics</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Last Updated</span>
                                <span class="stat-value">${profileData.lastUpdated ? new Date(profileData.lastUpdated).toLocaleString() : 'Never'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Profile Version</span>
                                <span class="stat-value">${profileData.version || '1.0.0'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Data Backups</span>
                                <span class="stat-value" id="backup-count">1</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ============================================
// 🎯 MODULE REGISTRATION
// ============================================

// Register with FarmModules framework
if (typeof FarmModules !== 'undefined') {
    FarmModules.registerModule('profile', {
        name: 'Profile',
        version: '2.0.0',
        render: renderProfile,
        initialize: initializeProfileModule,
        onRender: function() {
            console.log('🎨 Profile module rendered');
            Profile.init();
        },
        api: {
            getProfile: () => Profile.getProfile(),
            getUser: () => Profile.getUser(),
            saveProfile: () => Profile.saveProfileData(),
            updateFarmName: (name) => Profile.updateFarmName(name),
            logout: () => Profile.logout()
        }
    });
    console.log('✅ Profile module registered with FarmModules');
} else {
    console.error('❌ FarmModules framework not found, using standalone mode');
    // Standalone initialization
    initializeProfileModule();
}

// Export for global access
window.ProfileModule = Profile;
window.ProfileManager = ProfileManager;

console.log('✅ Complete profile module loaded with all utilities');
