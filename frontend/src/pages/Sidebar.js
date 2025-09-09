// frontend/src/pages/Sidebar.js - FIXED DASHBOARD HIGHLIGHTING
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  FolderOpen, 
  Users, 
  BookOpen, 
  Puzzle, 
  UserCog, 
  Shield, 
  HelpCircle, 
  User, 
  LogOut,
  ChevronRight 
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Main navigation items (for all users)
  const mainNavItems = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'projects', label: 'Projects', path: '/projects', icon: FolderOpen },
    { id: 'friends', label: 'Friends', path: '/friends', icon: Users },
    { id: 'learns', label: 'Learns', path: '/learns', icon: BookOpen }
  ];

  // Admin/Moderator navigation items (only visible to admin/moderator users)
  const adminNavItems = user?.role === 'admin' || user?.role === 'moderator' ? [
    { id: 'challenges', label: 'Challenges', path: '/challenges', icon: Puzzle },
    ...(user?.role === 'admin' ? [
      { id: 'manage-users', label: 'Manage Users', path: '/admin/users', icon: UserCog }
    ] : []),
    { id: 'admin', label: 'Admin Panel', path: '/admin', icon: Shield }
  ] : [];

  // Bottom navigation items
  const bottomNavItems = [
    { id: 'help', label: 'Help Center', path: '/help', icon: HelpCircle }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Improved path matching logic - FIXED to handle dashboard properly
  const isActive = (path) => {
    // For home route, check if we're on dashboard or exact home
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    
    // Special handling for admin routes to prevent overlap
    if (path === '/admin' && location.pathname === '/admin/users') {
      return false; // Don't highlight admin panel when on manage users
    }
    
    if (path === '/admin/users') {
      return location.pathname === '/admin/users' || location.pathname.startsWith('/admin/users/');
    }
    
    // For other paths, use startsWith but be more specific
    if (path === '/admin') {
      return location.pathname === '/admin' || (location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/users'));
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

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setShowUserMenu(false);
      navigate('/', { replace: true });
    }
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
      backgroundColor: '#0F1116',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      overflow: 'hidden'
    },
    backgroundSymbols: {
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '20px',
      lineHeight: '24px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    logo: {
      position: 'relative',
      zIndex: 10,
      padding: '24px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      borderRadius: '6px',
      transform: 'rotate(45deg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoIconInner: {
      width: '16px',
      height: '16px',
      background: 'white',
      borderRadius: '3px',
      transform: 'rotate(-45deg)'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
      letterSpacing: '-0.025em'
    },
    nav: {
      position: 'relative',
      zIndex: 10,
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
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: '#d1d5db',
      borderRadius: '0',
      margin: '0 12px',
      marginBottom: '4px',
      backdropFilter: 'blur(8px)'
    },
    navItemActive: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      borderRadius: '12px',
      transform: 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    navItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      transform: 'translateX(2px)'
    },
    adminNavItem: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: '#d1d5db',
      borderRadius: '0',
      margin: '0 12px',
      marginBottom: '4px',
      backdropFilter: 'blur(8px)'
    },
    adminNavItemActive: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      borderRadius: '12px',
      transform: 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    adminNavItemHover: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '12px',
      transform: 'translateX(2px)'
    },
    adminSeparator: {
      height: '1px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      margin: '16px 20px',
      borderRadius: '1px'
    },
    bottomNav: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '20px'
    },
    userSection: {
      position: 'relative',
      zIndex: 10,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px 16px',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      flex: 1,
      padding: '10px 12px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    userInfoHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-1px)'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      marginRight: '12px',
      flexShrink: 0,
      border: '2px solid rgba(96, 165, 250, 0.3)'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      lineHeight: 1.2
    },
    userRole: {
      fontSize: '12px',
      color: '#9ca3af',
      textTransform: 'capitalize',
      marginTop: '2px'
    },
    icon: {
      marginRight: '12px',
      width: '20px',
      height: '20px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500'
    },
    threeDots: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '16px',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    threeDotsHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateY(-1px)'
    },
    userMenu: {
      position: 'absolute',
      bottom: '100%',
      left: '20px',
      right: '20px',
      backgroundColor: '#1a1c20',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      zIndex: 1001,
      overflow: 'hidden',
      backdropFilter: 'blur(20px)'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      color: '#d1d5db',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    menuItemLast: {
      borderBottom: 'none'
    },
    menuItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white'
    },
    menuItemIcon: {
      marginRight: '10px',
      width: '16px',
      height: '16px'
    },
    adminBadge: {
      marginLeft: 'auto',
      fontSize: '9px',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#f87171',
      padding: '2px 6px',
      borderRadius: '8px',
      fontWeight: 'bold',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Background Code Symbols */}
      <div style={styles.backgroundSymbols}>
        <div style={{
          ...styles.codeSymbol,
          left: '25%', top: '15%', color: '#2E3344', transform: 'rotate(-15deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '75%', top: '30%', color: '#ABB5CE', transform: 'rotate(20deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '15%', top: '45%', color: '#6C758E', transform: 'rotate(-25deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '85%', top: '60%', color: '#292A2E', transform: 'rotate(30deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '35%', top: '75%', color: '#3A4158', transform: 'rotate(-10deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '65%', top: '85%', color: '#5A6B8C', transform: 'rotate(15deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '10%', top: '25%', color: '#4F5A7A', transform: 'rotate(35deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '90%', top: '40%', color: '#8A94B8', transform: 'rotate(-20deg)'
        }}>&#60;/&#62;</div>
      </div>

      {/* Logo Section */}
      <div style={styles.logo}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <div style={styles.logoIconInner} />
          </div>
          <h1 style={styles.logoText}>TechSync</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          {/* Main Navigation Items (for all users) */}
          {mainNavItems.map((item) => {
            const isActiveItem = isActive(item.path);
            const IconComponent = item.icon;
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
                    e.target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <IconComponent size={20} style={styles.icon} />
                <span style={styles.label}>{item.label}</span>
              </div>
            );
          })}

          {/* Admin/Moderator Navigation Items (only for admin/moderator) */}
          {adminNavItems.length > 0 && (
            <>
              <div style={styles.adminSeparator}></div>
              {adminNavItems.map((item) => {
                const isActiveItem = isActive(item.path);
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    style={{
                      ...styles.adminNavItem,
                      ...(isActiveItem ? styles.adminNavItemActive : {})
                    }}
                    onClick={() => handleNavigation(item.path)}
                    onMouseEnter={(e) => {
                      if (!isActiveItem) {
                        Object.assign(e.target.style, styles.adminNavItemHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveItem) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderRadius = '0';
                        e.target.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <IconComponent size={20} style={styles.icon} />
                    <span style={styles.label}>{item.label}</span>
                    {user?.role === 'admin' && item.id === 'admin' && (
                      <span style={styles.adminBadge}>
                        ADMIN
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Bottom Navigation - Help Center */}
        <div style={{ ...styles.navSection, ...styles.bottomNav }}>
          {bottomNavItems.map((item) => {
            const isActiveItem = isActive(item.path);
            const IconComponent = item.icon;
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
                    e.target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <IconComponent size={20} style={styles.icon} />
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
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={styles.userAvatar}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 
               user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.userName}>
                {user?.full_name || user?.username || 'User'}
              </div>
              {/* Show user role if admin or moderator */}
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <div style={styles.userRole}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              )}
            </div>
          </div>
          <button
            style={styles.threeDots}
            onClick={handleThreeDotsClick}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.threeDotsHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.color = '#9ca3af';
              e.target.style.transform = 'translateY(0)';
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
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#d1d5db';
              }}
            >
              <User size={16} style={styles.menuItemIcon} />
              Profile Settings
            </div>
            {/* Admin menu item (only for admins) */}
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <div
                style={styles.menuItem}
                onClick={() => {
                  navigate('/admin');
                  setShowUserMenu(false);
                }}
                onMouseEnter={(e) => {
                  Object.assign(e.target.style, styles.menuItemHover);
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#d1d5db';
                }}
              >
                <Shield size={16} style={styles.menuItemIcon} />
                Admin Dashboard
              </div>
            )}
            <div
              style={{ ...styles.menuItem, ...styles.menuItemLast }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.menuItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#d1d5db';
              }}
            >
              <LogOut size={16} style={styles.menuItemIcon} />
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;