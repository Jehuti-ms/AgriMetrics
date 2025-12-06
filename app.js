/* NAVBAR STYLES - MINIMAL & WORKING */
.top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: white;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 1000;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.nav-brand-logo {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.brand-text {
    font-size: 20px;
    font-weight: bold;
    color: #333;
}

.brand-subtitle {
    font-size: 12px;
    color: #666;
}

.nav-items {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 10px;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s;
}

.nav-item:hover {
    background: #e0e0e0;
}

.nav-item.active {
    background: #4CAF50;
    border-color: #4CAF50;
    color: white;
}

.nav-icon {
    font-size: 20px;
    margin-bottom: 4px;
}

.nav-label {
    font-size: 11px;
    font-weight: 600;
}

.hamburger-menu {
    background: #4CAF50;
    color: white;
    border: none;
}

#side-menu {
    position: fixed;
    top: 0;
    right: -280px;
    bottom: 0;
    width: 280px;
    background: white;
    border-left: 1px solid #ddd;
    z-index: 999;
    transition: right 0.3s;
    padding: 20px;
}

#side-menu.active {
    right: 0;
}

.side-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin: 6px 0;
    border-radius: 8px;
    background: #f5f5f5;
    cursor: pointer;
}

.side-menu-item.active {
    background: #4CAF50;
    color: white;
}

#content-area {
    margin-top: 80px;
    padding: 20px;
}

@media (min-width: 769px) {
    #side-menu {
        right: auto;
        left: 0;
        width: 260px;
        border-right: 1px solid #ddd;
        border-left: none;
    }
    
    #side-menu.active {
        left: 0;
    }
    
    .hamburger-menu {
        display: none;
    }
    
    #content-area {
        margin-left: 260px;
        margin-top: 0;
    }
}
