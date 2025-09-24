// frontend/src/pages/Sidebar.js - WITH TOGGLE FUNCTIONALITY
import React, { useState, useEffect } from 'react';
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
  
  // NEW STATE: For sidebar collapse functionality
  const [isCollapsed, setIsCollapsed] = useState(false);

  // NEW: Listen for sidebar toggle events from Dashboard
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

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
      width: isCollapsed ? '60px' : '250px', // Dynamic width based on collapse state
      height: '100vh',
      backgroundColor: '#0F1116',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      overflow: 'hidden',
      transition: 'width 0.3s ease' // Smooth transition
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
      padding: isCollapsed ? '24px 10px' : '24px 20px', // Adjust padding for collapsed state
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: isCollapsed ? 'center' : 'center', // Center logo in both states
      transition: 'padding 0.3s ease'
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
      letterSpacing: '-0.025em',
      opacity: isCollapsed ? 0 : 1, // Hide text when collapsed
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap'
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
      padding: isCollapsed ? '12px 10px' : '12px 20px', // Adjust padding for collapsed state
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: '#d1d5db',
      borderRadius: '0',
      margin: isCollapsed ? '0 6px' : '0 12px', // Adjust margins for collapsed state
      marginBottom: '4px',
      backdropFilter: 'blur(8px)',
      justifyContent: isCollapsed ? 'center' : 'flex-start' // Center icons when collapsed
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
      padding: isCollapsed ? '12px 10px' : '12px 20px', // Adjust padding for collapsed state
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: '#d1d5db',
      borderRadius: '0',
      margin: isCollapsed ? '0 6px' : '0 12px', // Adjust margins for collapsed state
      marginBottom: '4px',
      backdropFilter: 'blur(8px)',
      justifyContent: isCollapsed ? 'center' : 'flex-start' // Center icons when collapsed
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
      margin: isCollapsed ? '16px 10px' : '16px 20px', // Adjust margins for collapsed state
      borderRadius: '1px',
      transition: 'margin 0.3s ease'
    },
    bottomNav: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '20px'
    },
    userSection: {
      position: 'relative',
      zIndex: 10,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: isCollapsed ? '20px 8px' : '20px 16px', // Adjust padding for collapsed state
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      transition: 'padding 0.3s ease'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'space-between', // Center when collapsed
      flexDirection: isCollapsed ? 'column' : 'row', // Stack vertically when collapsed
      gap: isCollapsed ? '8px' : '0'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      flex: isCollapsed ? 'none' : 1,
      padding: isCollapsed ? '8px' : '10px 12px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
      flexDirection: isCollapsed ? 'column' : 'row', // Stack vertically when collapsed
      gap: isCollapsed ? '6px' : '12px'
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
      marginRight: isCollapsed ? '0' : '12px', // Remove margin when collapsed
      flexShrink: 0,
      border: '2px solid rgba(96, 165, 250, 0.3)',
      transition: 'margin 0.3s ease'
    },
    userDetails: {
      display: isCollapsed ? 'none' : 'block', // Hide user details when collapsed
      transition: 'opacity 0.3s ease'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      lineHeight: 1.2,
      textAlign: isCollapsed ? 'center' : 'left'
    },
    userRole: {
      fontSize: '12px',
      color: '#9ca3af',
      textTransform: 'capitalize',
      marginTop: '2px',
      textAlign: isCollapsed ? 'center' : 'left'
    },
    icon: {
      marginRight: isCollapsed ? '0' : '12px', // Remove margin when collapsed
      width: '20px',
      height: '20px',
      transition: 'margin 0.3s ease'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      opacity: isCollapsed ? 0 : 1, // Hide labels when collapsed
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap'
    },
    threeDots: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '16px',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: isCollapsed ? '4px' : '6px 8px', // Smaller padding when collapsed
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
      display: isCollapsed ? 'none' : 'block' // Hide three dots when collapsed
    },
    threeDotsHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateY(-1px)'
    },
    userMenu: {
      position: 'absolute',
      bottom: '100%',
      left: isCollapsed ? '70px' : '20px', // Adjust position when collapsed
      right: isCollapsed ? 'auto' : '20px',
      width: isCollapsed ? '200px' : 'auto', // Fixed width when collapsed
      backgroundColor: '#1a1c20',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      zIndex: 1001,
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s ease'
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
      border: '1px solid rgba(239, 68, 68, 0.3)',
      opacity: isCollapsed ? 0 : 1, // Hide badge when collapsed
      transition: 'opacity 0.3s ease'
    },
    // NEW: Tooltip styles for collapsed state
    tooltip: {
      position: 'absolute',
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '8px',
      backgroundColor: '#374151',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      zIndex: 1002,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.2s ease',
      pointerEvents: 'none'
    },
    tooltipVisible: {
      opacity: 1,
      visibility: 'visible'
    },
    tooltipArrow: {
      position: 'absolute',
      left: '-4px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 0,
      height: 0,
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent',
      borderRight: '4px solid #374151'
    }
  };

  // NEW: Component for navigation items with tooltips
  const NavItem = ({ item, isAdmin = false, isActiveItem, onNavigate }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const IconComponent = item.icon;
    const itemStyles = isAdmin ? styles.adminNavItem : styles.navItem;
    const activeStyles = isAdmin ? styles.adminNavItemActive : styles.navItemActive;
    const hoverStyles = isAdmin ? styles.adminNavItemHover : styles.navItemHover;

    return (
      <div
        style={{
          ...itemStyles,
          ...(isActiveItem ? activeStyles : {}),
          position: 'relative'
        }}
        onClick={() => onNavigate(item.path)}
        onMouseEnter={(e) => {
          if (isCollapsed) {
            setShowTooltip(true);
          }
          if (!isActiveItem) {
            Object.assign(e.target.style, hoverStyles);
          }
        }}
        onMouseLeave={(e) => {
          if (isCollapsed) {
            setShowTooltip(false);
          }
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
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div 
            style={{
              ...styles.tooltip,
              ...(showTooltip ? styles.tooltipVisible : {})
            }}
          >
            {item.label}
            <div style={styles.tooltipArrow} />
          </div>
        )}
      </div>
    );
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
          {mainNavItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActiveItem={isActive(item.path)}
              onNavigate={handleNavigation}
            />
          ))}

          {/* Admin/Moderator Navigation Items (only for admin/moderator) */}
          {adminNavItems.length > 0 && (
            <>
              <div style={styles.adminSeparator}></div>
              {adminNavItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isAdmin={true}
                  isActiveItem={isActive(item.path)}
                  onNavigate={handleNavigation}
                />
              ))}
            </>
          )}
        </div>

        {/* Bottom Navigation - Help Center */}
        <div style={{ ...styles.navSection, ...styles.bottomNav }}>
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActiveItem={isActive(item.path)}
              onNavigate={handleNavigation}
            />
          ))}
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
            <div style={styles.userDetails}>
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
          
          {/* Three dots menu - hidden when collapsed */}
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