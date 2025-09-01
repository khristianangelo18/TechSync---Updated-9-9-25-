import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';

function ProjectSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Project navigation items
  const projectNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: `/project/${projectId}/dashboard`, icon: '📊' },
    { id: 'tasks', label: 'Tasks', path: `/project/${projectId}/tasks`, icon: '✅' },
    { id: 'chats', label: 'Chats', path: `/project/${projectId}/chats`, icon: '💬' },
    { id: 'files', label: 'Files', path: `/project/${projectId}/files`, icon: '📁' },
    { id: 'members', label: 'Members', path: `/project/${projectId}/members`, icon: '👥' }
  ];

  const bottomNavItems = [
    { id: 'help', label: 'Help Center', path: `/project/${projectId}/help`, icon: '❓' }
  ];

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(projectId);
        setProject(response.data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleThreeDotsClick = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleExitProject = () => {
    navigate('/projects');
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
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #dee2e6',
      backgroundColor: 'white'
    },
    projectInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    backButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease'
    },
    backButtonHover: {
      backgroundColor: '#e9ecef'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    projectBadge: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase'
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
    navIcon: {
      marginRight: '12px',
      fontSize: '16px'
    },
    navLabel: {
      fontSize: '14px',
      fontWeight: '500'
    },
    userSection: {
      padding: '20px',
      borderTop: '1px solid #dee2e6',
      backgroundColor: 'white',
      position: 'relative'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    userDetails: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      cursor: 'pointer', // Make profile clickable
      padding: '4px',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    userDetailsHover: {
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
    threeDotsButton: {
      background: 'none',
      border: 'none',
      color: '#6c757d',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '4px 6px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    threeDotsButtonHover: {
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
    exitMenuItem: {
      color: '#007bff'
    },
    exitMenuItemHover: {
      backgroundColor: '#e3f2fd'
    },
    logoutMenuItem: {
      color: '#dc3545'
    },
    logoutMenuItemHover: {
      backgroundColor: '#fde8e8'
    },
    menuItemIcon: {
      marginRight: '8px',
      fontSize: '14px'
    }
  };

  if (loading) {
    return (
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <div style={{ textAlign: 'center', color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.sidebar}>
      {/* Project Header */}
      <div style={styles.header}>
        <div style={styles.projectInfo}>
          <button
            style={styles.backButton}
            onClick={() => navigate('/projects')}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.backButtonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={styles.projectTitle}>
              {project?.title || 'Project Workspace'}
            </h1>
            {project?.status && (
              <div style={{
                ...styles.projectBadge,
                backgroundColor: project.status === 'active' ? '#28a745' : 
                               project.status === 'completed' ? '#007bff' : '#6c757d',
                marginTop: '8px'
              }}>
                {project.status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          {projectNavItems.map((item) => {
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
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation - Help Center */}
        <div style={styles.navSection}>
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
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Section with Clickable Profile */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div
            style={styles.userDetails}
            onClick={handleProfileClick}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.userDetailsHover);
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
            style={styles.threeDotsButton}
            onClick={handleThreeDotsClick}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.threeDotsButtonHover);
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
                ...styles.exitMenuItem
              }}
              onClick={handleExitProject}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.exitMenuItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <span style={styles.menuItemIcon}>🚪</span>
              Exit Project Workspace
            </div>
            <div 
              style={{
                ...styles.menuItem, 
                ...styles.menuItemLast,
                ...styles.logoutMenuItem
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.logoutMenuItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <span style={styles.menuItemIcon}>🚪</span>
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectSidebar;