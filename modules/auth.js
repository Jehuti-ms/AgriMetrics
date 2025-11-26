// modules/auth.js - Fixed to hide sidebar
console.log('Loading auth module...');

const AuthModule = {
    name: 'auth',
    initialized: false,

    initialize() {
        console.log('🔐 Initializing auth...');
        this.hideSidebar();
        this.render();
        this.initialized = true;
        return true;
    },

    hideSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar) sidebar.style.display = 'none';
        if (mainContent) mainContent.style.marginLeft = '0';
    },

    showSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar) sidebar.style.display = 'block';
        if (mainContent) mainContent.style.marginLeft = '260px';
    },

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        // Check if already authenticated
        if (localStorage.getItem('farm-authenticated') === 'true') {
            this.showSidebar();
            if (window.farmApp) {
                window.farmApp.loadModule('dashboard');
            }
            return;
        }

        this.hideSidebar();
        contentArea.innerHTML = this.getTemplate();
        this.setupEventListeners();
    },

    getTemplate() {
        return `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);">
                    <!-- Logo -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 64px; margin-bottom: 10px;">🚜</div>
                        <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Farm Management</h1>
                        <p style="color: #666; font-size: 16px;">Sign in to your account</p>
                    </div>

                    <!-- Sign In Form -->
                    <form id="signin-form">
                        <div style="display: grid; gap: 20px; margin-bottom: 30px;">
                            <div>
                                <input 
                                    type="text" 
                                    id="username" 
                                    placeholder="Username"
                                    required 
                                    style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 16px; box-sizing: border-box;"
                                    autocomplete="username"
                                >
                            </div>

                            <div>
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="Password"
                                    required 
                                    style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 16px; box-sizing: border-box;"
                                    autocomplete="current-password"
                                >
                            </div>

                            <button type="submit" style="width: 100%; background: #10b981; color: white; border: none; border-radius: 10px; padding: 14px 20px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                                Sign In
                            </button>
                        </div>
                    </form>

                    <!-- Demo Info -->
                    <div style="background: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e5e7eb;">
                        <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-align: center;">Demo Credentials</h3>
                        <div style="font-size: 13px; color: #6b7280; text-align: left; line-height: 1.5;">
                            <div>👤 <strong>admin</strong> / admin123</div>
                            <div>👤 <strong>farm</strong> / farm123</div>
                            <div>👤 <strong>user</strong> / user123</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        const form = document.getElementById('signin-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        // Auto-focus username field
        setTimeout(() => {
            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.focus();
            }
        }, 100);
    },

    handleSignIn(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        setTimeout(() => {
            if (this.authenticate(username, password)) {
                localStorage.setItem('farm-authenticated', 'true');
                localStorage.setItem('farm-username', username);
                
                // Show sidebar and redirect
                this.showSidebar();
                if (window.farmApp) {
                    window.farmApp.loadModule('dashboard');
                }
            } else {
                alert('Invalid username or password');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 1000);
    },

    authenticate(username, password) {
        const validUsers = {
            'admin': 'admin123',
            'farm': 'farm123', 
            'user': 'user123'
        };
        return validUsers[username] === password;
    },

    logout() {
        localStorage.removeItem('farm-authenticated');
        localStorage.removeItem('farm-username');
        this.hideSidebar();
        this.render();
    }
};

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('auth', AuthModule);
    console.log('✅ Auth module registered');
}
