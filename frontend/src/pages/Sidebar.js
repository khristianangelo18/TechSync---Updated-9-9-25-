import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const mainNavItems = [
    { id: 'home', label: 'Home', path: '/', icon: '🏠' },
    { id: 'projects', label: 'Projects', path: '/projects', icon: '📁' },
    { id: 'friends', label: 'Friends', path: '/friends', icon: '👥' },
    { id: 'learns', label: 'Learns', path: '/learns', icon: '📚' }
  ];

  const bottomNavItems = [
    { id: 'help', label: 'Help Center', path: '/help', icon: '❓' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleThreeDotsClick = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const styles = {
    sidebar: {
      width: '250px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    },
    logo: {
      padding: '20px',
      borderBottom: '1px solid #dee2e6',
      textAlign: 'center'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    nav: {
      flex: 1,
      padding: '20px 0'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      cursor: 'pointer',
      textDecoration: 'none',
      color: '#666',
      transition: 'all 0.2s ease',
      borderLeft: '3px solid transparent'
    },
    navItemActive: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      borderLeftColor: '#1976d2'
    },
    navItemHover: {
      backgroundColor: '#f5f5f5'
    },
    icon: {
      fontSize: '18px',
      marginRight: '12px',
      minWidth: '20px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500'
    },
    bottomNav: {
      borderTop: '1px solid #dee2e6',
      padding: '15px 0'
    },
    userSection: {
      padding: '15px 20px',
      borderTop: '1px solid #dee2e6',
      backgroundColor: '#fff3e0',
      position: 'relative'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#f57c00'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center'
    },
    threeDots: {
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'background-color 0.2s ease',
      userSelect: 'none'
    },
    threeDotsHover: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    userMenu: {
      position: 'absolute',
      bottom: '100%',
      left: '20px',
      right: '20px',
      marginBottom: '5px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1001,
      overflow: 'hidden'
    },
    menuHeader: {
      padding: '12px 15px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    },
    menuItem: {
      padding: '12px 15px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#dc3545',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    menuItemHover: {
      backgroundColor: '#f8f9fa'
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo/Brand */}
      <div style={styles.logo}>
        <h3 style={styles.logoText}>TechSync</h3>
      </div>

      {/* Main Navigation */}
      <nav style={styles.nav}>
        {mainNavItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {})
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = styles.navItemHover.backgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        {bottomNavItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {})
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = styles.navItemHover.backgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* User Section with Three Dots Menu */}
      <div style={styles.userSection}>
        <div style={styles.userItem}>
          <div style={styles.userInfo}>
            <span style={styles.icon}>👤</span>
            <span style={styles.label}>
              {user?.full_name || user?.username || 'User'}
            </span>
          </div>
          <div
            style={styles.threeDots}
            onClick={handleThreeDotsClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = styles.threeDotsHover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ⋯
          </div>
        </div>

        {/* User Menu (drops up) */}
        {showUserMenu && (
          <div style={styles.userMenu}>
            <div
              style={styles.menuItem}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = styles.menuItemHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Log out @{user?.username}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;