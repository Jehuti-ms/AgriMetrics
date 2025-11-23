// app.js - Updated to use modules
class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.modules = {};
        this.init();
    }

    async init() {
        try {
            // Initialize Firebase first
            await this.initializeFirebase();
            
            // Check authentication state
            this.setupAuthListener();
            
            // Setup navigation and event listeners
            this.setupNavigation();
            this.setupEventListeners();
            
            console.log('Farm Management App initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }
    }

    setupAuthListener() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showApp();
                this.loadUserData();
            } else {
                this.currentUser = null;
                this.showAuth();
            }
        });
    }

    setupNavigation() {
        const navConfig = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'income-expenses', label: 'Income & Expenses', icon: '💰' },
            { id: 'inventory-check', label: 'Inventory', icon: '📦' },
            { id: 'reports', label: 'Reports', icon: '📈' },
            { id: 'animals', label: 'Animals', icon: '🐄' },
            { id: 'crops', label: 'Crops', icon: '🌱' }
        ];

        const navElement = document.getElementById('main-nav');
        const navList = document.createElement('ul');
        navList.className = 'nav-list';

        navConfig.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'nav-link';
            a.dataset.section = item.id;
            a.innerHTML = `${item.icon} ${item.label}`;
            
            li.appendChild(a);
            navList.appendChild(li);
        });

        // Add user info and logout
        const userLi = document.createElement('li');
        userLi.className = 'nav-item';
        userLi.innerHTML = `
            <div class="user-info">
                <span id="user-name">User</span>
                <button class="btn btn-secondary logout-btn">Logout</button>
            </div>
        `;
        navList.appendChild(userLi);

        navElement.appendChild(navList);

        // Add logout handler
        navElement.querySelector('.logout-btn').addEventListener('click', () => this.logout());
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            }
        });
    }

    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }

    showApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Update user name in nav
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.displayName || this.currentUser.email;
        }
        
        this.showSection(this.currentSection);
    }

    async showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update content
        this.currentSection = sectionId;
        await this.loadSectionContent(sectionId);
    }

    async loadSectionContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '<div class="text-center"><div class="spinner"></div>Loading...</div>';

        try {
            let content = '';
            
            switch(sectionId) {
                case 'dashboard':
                    content = await window.dashboardModule.loadDashboard();
                    break;
                case 'income-expenses':
                    content = await this.loadIncomeExpenses();
                    break;
                case 'inventory-check':
                    content = await this.loadInventory();
                    break;
                case 'reports':
                    content = await this.loadReports();
                    break;
                default:
                    content = `<h1>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h1><p>Section under development</p>`;
            }
            
            contentArea.innerHTML = content;
        } catch (error) {
            console.error('Error loading section:', error);
            contentArea.innerHTML = '<div class="text-error">Error loading content</div>';
        }
    }

    async loadIncomeExpenses() {
        return `
            <div class="section-header">
                <h1>Income & Expenses</h1>
                <p>Manage your farm finances</p>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2024-01-15</td>
                            <td>Corn Harvest</td>
                            <td>Crops</td>
                            <td>$2,500.00</td>
                            <td class="text-success">Income</td>
                        </tr>
                        <tr>
                            <td>2024-01-14</td>
                            <td>Animal Feed</td>
                            <td>Supplies</td>
                            <td>$450.00</td>
                            <td class="text-error">Expense</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadInventory() {
        return `
            <div class="section-header">
                <h1>Inventory Management</h1>
                <p>Track your farm inventory</p>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Corn Seeds</td>
                            <td>Seeds</td>
                            <td>150</td>
                            <td>kg</td>
                            <td class="text-success">In Stock</td>
                        </tr>
                        <tr>
                            <td>Animal Feed</td>
                            <td>Feed</td>
                            <td>45</td>
                            <td>bags</td>
                            <td class="text-warning">Low Stock</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadReports() {
        return `
            <div class="section-header">
                <h1>Reports & Analytics</h1>
                <p>Generate farm reports and analytics</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Monthly Report</h3>
                    <p>Generate monthly summary</p>
                    <button class="btn btn-primary mt-1">Generate</button>
                </div>
                <div class="stat-card">
                    <h3>Financial Report</h3>
                    <p>Income vs Expenses</p>
                    <button class="btn btn-primary mt-1">Generate</button>
                </div>
                <div class="stat-card">
                    <h3>Inventory Report</h3>
                    <p>Stock levels analysis</p>
                    <button class="btn btn-primary mt-1">Generate</button>
                </div>
            </div>
        `;
    }

    async loadUserData() {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists) {
                console.log('User data loaded:', userDoc.data());
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async logout() {
        try {
            await firebase.auth().signOut();
            this.coreModule.showNotification('Logged out successfully', 'success');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FarmManagementApp();
});
