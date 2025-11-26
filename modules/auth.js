// modules/auth.js
console.log('Loading auth module...');

const AuthModule = {
    name: 'auth',
    initialized: false,

    initialize() {
        console.log('🔐 Initializing auth...');
        this.renderAuth();
        this.initialized = true;
        return true;
    },

    handleSignIn(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!username || !password) {
            this.showNotification('Please enter both username and password', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.signin-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        // Simulate authentication (replace with real auth)
        setTimeout(() => {
            if (this.authenticate(username, password)) {
                this.showNotification('Sign in successful!', 'success');
                localStorage.setItem('farm-user-authenticated', 'true');
                localStorage.setItem('farm-username', username);
                
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    if (window.FarmModules && window.FarmModules.loadModule) {
                        window.FarmModules.loadModule('dashboard');
                    }
                }, 1000);
            } else {
                this.showNotification('Invalid username or password', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 1500);
    },

    authenticate(username, password) {
        // Simple demo authentication
        // In production, replace with real authentication
        const validUsers = {
            'admin': 'admin123',
            'farm': 'farm123',
            'user': 'user123'
        };

        return validUsers[username] === password;
    },

    renderAuth() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        // Check if already authenticated
        if (localStorage.getItem('farm-user-authenticated') === 'true') {
            if (window.FarmModules && window.FarmModules.loadModule) {
                window.FarmModules.loadModule('dashboard');
            }
            return;
        }

        contentArea.innerHTML = this.getAuthTemplate();
        this.setupAuthEventListeners();
    },

    getAuthTemplate() {
        return `
            <div class="auth-container" style="
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                ">
                    <!-- Logo -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🚜</div>
                        <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Farm Management</h1>
                        <p style="color: #666; font-size: 16px;">Sign in to your account</p>
                    </div>

                    <!-- Sign In Form -->
                    <form id="signin-form">
                        <div style="display: grid; gap: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Username</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    required 
                                    style="
                                        width: 100%;
                                        padding: 12px 16px;
                                        border: 1px solid #d1d5db;
                                        border-radius: 10px;
                                        font-size: 16px;
                                        box-sizing: border-box;
                                        transition: border-color 0.2s ease;
                                    "
                                    placeholder="Enter your username"
                                    autocomplete="username"
                                >
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    required 
                                    style="
                                        width: 100%;
                                        padding: 12px 16px;
                                        border: 1px solid #d1d5db;
                                        border-radius: 10px;
                                        font-size: 16px;
                                        box-sizing: border-box;
                                        transition: border-color 0.2s ease;
                                    "
                                    placeholder="Enter your password"
                                    autocomplete="current-password"
                                >
                            </div>

                            <button type="submit" class="signin-btn" style="
                                width: 100%;
                                background: linear-gradient(135deg, #10b981, #059669);
                                color: white;
                                border: none;
                                border-radius: 10px;
                                padding: 14px 20px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                margin-top: 10px;
                            ">
                                Sign In
                            </button>
                        </div>
                    </form>

                    <!-- Demo Credentials -->
                    <div style="
                        margin-top: 30px;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 10px;
                        border: 1px solid #e5e7eb;
                    ">
                        <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 10px;">Demo Credentials:</h3>
                        <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
                            <div>👤 <strong>admin</strong> / admin123</div>
                            <div>👤 <strong>farm</strong> / farm123</div>
                            <div>👤 <strong>user</strong> / user123</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    setupAuthEventListeners() {
        const form = document.getElementById('signin-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        // Add input focus effects
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            });

            input.addEventListener('blur', (e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
            });
        });

        // Add button hover effects
        const button = document.querySelector('.signin-btn');
        if (button) {
            button.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
            });
        }
    },

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'auth-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    },

    logout() {
        localStorage.removeItem('farm-user-authenticated');
        localStorage.removeItem('farm-username');
        this.renderAuth();
        this.showNotification('Signed out successfully', 'success');
    }
};

// Add CSS animations for notifications
if (!document.querySelector('#auth-styles')) {
    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        /* Prevent body scroll on auth page */
        body.auth-page {
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
    `;
    document.head.appendChild(styles);
}

// Register auth module
if (window.FarmModules) {
    window.FarmModules.registerModule('auth', AuthModule);
    console.log('✅ Auth module registered');
}
