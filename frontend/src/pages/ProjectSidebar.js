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

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleExitProject = () => {
    navigate('/projects');
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

  const getStatusColor = (status) => {
    const colors = {
      recruiting: '#28a745',
      active: '#007bff',
      completed: '#6c757d',
      paused: '#ffc107',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

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
    projectHeader: {
      padding: '20px',
      borderBottom: '1px solid #dee2e6',
      backgroundColor: 'white'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
      color: '#333',
      wordBreak: 'break-word'
    },
    projectMeta: {
      fontSize: '12px',
      color: '#6c757d'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
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
      flex: 1
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
      cursor: 'pointer',
      fontSize: '16px',
      padding: '8px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    threeDotsButtonHover: {
      backgroundColor: '#e9ecef',
      color: '#333'
    },
    userMenu: {
      position: 'absolute',
      bottom: '70px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1001,
      minWidth: '200px',
      overflow: 'hidden'
    },
    menuItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#333',
      borderBottom: '1px solid #f8f9fa',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    menuItemLast: {
      borderBottom: 'none'
    },
    menuItemHover: {
      backgroundColor: '#f8f9fa'
    },
    menuItemIcon: {
      fontSize: '16px',
      width: '16px'
    },
    exitMenuItem: {
      color: '#dc3545',
      fontWeight: '500'
    },
    exitMenuItemHover: {
      backgroundColor: '#fff5f5'
    },
    logoutMenuItem: {
      color: '#dc3545',
      fontWeight: '500'
    },
    logoutMenuItemHover: {
      backgroundColor: '#fff5f5'
    },
    loadingText: {
      fontSize: '14px',
      color: '#6c757d'
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Project Header */}
      <div style={styles.projectHeader}>
        {loading ? (
          <div style={styles.loadingText}>Loading project...</div>
        ) : project ? (
          <>
            <h3 style={styles.projectTitle}>{project.title}</h3>
            <div style={styles.projectMeta}>
              <span 
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(project.status)
                }}
              >
                {project.status?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>
          </>
        ) : (
          <div style={styles.loadingText}>Project not found</div>
        )}
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

      {/* User Section */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
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