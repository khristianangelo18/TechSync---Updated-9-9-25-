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
  { id: 'challenges', label: 'Challenges', path: '/challenges', icon: '🧩' }, // Add this line
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

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
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
      textAlign: 'center',
      backgroundColor: 'white'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    nav: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 0'
    },
    navSection: {
      display: 'flex',
      flexDirection: 'column'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      color: '#333',
      borderRadius: '0',
      margin: '0 10px',
      marginBottom: '2px'
    },
    navItemActive: {
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '8px'
    },
    navItemHover: {
      backgroundColor: '#e9ecef',
      borderRadius: '8px'
    },
    icon: {
      fontSize: '16px',
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
      padding: '20px',
      borderTop: '1px solid #dee2e6',
      backgroundColor: 'white',
      position: 'relative'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      cursor: 'pointer', // Make profile clickable
      padding: '4px',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    userInfoHover: {
      backgroundColor: '#f8f9fa'
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: 'white'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    threeDots: {
      background: 'none',
      border: 'none',
      color: '#6c757d',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '4px 6px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    threeDotsHover: {
      backgroundColor: '#e9ecef',
      color: '#333'
    },
    userMenu: {
      position: 'absolute',
      bottom: '100%',
      left: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1001,
      overflow: 'hidden'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      fontSize: '14px',
      color: '#333',
      borderBottom: '1px solid #f1f3f4'
    },
    menuItemLast: {
      borderBottom: 'none'
    },
    menuItemHover: {
      backgroundColor: '#f8f9fa'
    },
    menuItemIcon: {
      marginRight: '8px',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo Section */}
      <div style={styles.logo}>
        <h1 style={styles.logoText}>TechSync</h1>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          {mainNavItems.map((item) => {
            const isActiveItem = isActive(item.path);
            return (
              <div
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(isActiveItem ? styles.navItemActive : {})
                }}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={(e) => {
                  if (!isActiveItem) {
                    Object.assign(e.target.style, styles.navItemHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveItem) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderRadius = '0';
                  }
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation - Help Center */}
        <div style={{ ...styles.navSection, ...styles.bottomNav }}>
          {bottomNavItems.map((item) => {
            const isActiveItem = isActive(item.path);
            return (
              <div
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(isActiveItem ? styles.navItemActive : {})
                }}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={(e) => {
                  if (!isActiveItem) {
                    Object.assign(e.target.style, styles.navItemHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveItem) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderRadius = '0';
                  }
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Section with Clickable Profile and Three Dots Menu */}
      <div style={styles.userSection}>
        <div style={styles.userItem}>
          <div
            style={styles.userInfo}
            onClick={handleProfileClick}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.userInfoHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <div style={styles.userAvatar}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 
               user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span style={styles.userName}>
              {user?.full_name || user?.username || 'User'}
            </span>
          </div>
          <button
            style={styles.threeDots}
            onClick={handleThreeDotsClick}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.threeDotsHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6c757d';
            }}
          >
            ⋮
          </button>
        </div>

        {/* User Menu */}
        {showUserMenu && (
          <div style={styles.userMenu}>
            <div
              style={styles.menuItem}
              onClick={handleProfileClick}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.menuItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <span style={styles.menuItemIcon}>👤</span>
              View Profile
            </div>
            <div
              style={{
                ...styles.menuItem,
                ...styles.menuItemLast
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.menuItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <span style={styles.menuItemIcon}>🚪</span>
              Log out @{user?.username}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;