import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import { 
  ArrowLeft, 
  BarChart3, 
  CheckSquare, 
  MessageCircle, 
  FolderOpen, 
  Users, 
  HelpCircle, 
  User, 
  LogOut,
  ExternalLink 
} from 'lucide-react';

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
    { id: 'dashboard', label: 'Dashboard', path: `/project/${projectId}/dashboard`, icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', path: `/project/${projectId}/tasks`, icon: CheckSquare },
    { id: 'chats', label: 'Chats', path: `/project/${projectId}/chats`, icon: MessageCircle },
    { id: 'files', label: 'Files', path: `/project/${projectId}/files`, icon: FolderOpen },
    { id: 'members', label: 'Members', path: `/project/${projectId}/members`, icon: Users }
  ];

  const bottomNavItems = [
    { id: 'help', label: 'Help Center', path: `/project/${projectId}/help`, icon: HelpCircle }
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
    header: {
      position: 'relative',
      zIndex: 10,
      padding: '24px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)'
    },
    projectInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    },
    backButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateY(-1px)'
    },
    projectDetails: {
      flex: 1,
      minWidth: 0,
      textAlign: 'center',
      marginRight: '44px'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'white',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: 1.2
    },
    projectBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginTop: '8px',
      display: 'inline-block',
      border: '1px solid rgba(59, 130, 246, 0.3)'
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
    navIcon: {
      marginRight: '12px',
      width: '20px',
      height: '20px'
    },
    navLabel: {
      fontSize: '14px',
      fontWeight: '500'
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
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    userDetails: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      cursor: 'pointer',
      padding: '10px 12px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    userDetailsHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-1px)'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      flexShrink: 0,
      border: '2px solid rgba(96, 165, 250, 0.3)'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      lineHeight: 1.2
    },
    threeDotsButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#9ca3af',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    threeDotsButtonHover: {
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
    exitMenuItem: {
      color: '#60a5fa'
    },
    exitMenuItemHover: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    logoutMenuItem: {
      color: '#f87171'
    },
    logoutMenuItemHover: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    },
    menuItemIcon: {
      marginRight: '10px',
      width: '16px',
      height: '16px'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '14px'
    }
  };

  if (loading) {
    return (
      <div style={styles.sidebar}>
        {/* Floating Animation CSS */}
        <style>
          {`
            @keyframes floatAround1 {
              0%, 100% { transform: translate(0, 0) rotate(-15deg); }
              25% { transform: translate(20px, -15px) rotate(-10deg); }
              50% { transform: translate(-10px, 20px) rotate(-20deg); }
              75% { transform: translate(15px, 5px) rotate(-12deg); }
            }
            @keyframes floatAround2 {
              0%, 100% { transform: translate(0, 0) rotate(20deg); }
              33% { transform: translate(-20px, 10px) rotate(25deg); }
              66% { transform: translate(25px, -8px) rotate(15deg); }
            }
            @keyframes floatAround3 {
              0%, 100% { transform: translate(0, 0) rotate(-25deg); }
              20% { transform: translate(-15px, -20px) rotate(-20deg); }
              40% { transform: translate(20px, 15px) rotate(-30deg); }
              60% { transform: translate(-8px, -10px) rotate(-22deg); }
              80% { transform: translate(12px, 18px) rotate(-28deg); }
            }
            @keyframes floatAround4 {
              0%, 100% { transform: translate(0, 0) rotate(30deg); }
              50% { transform: translate(-30px, 25px) rotate(35deg); }
            }
            @keyframes floatAround5 {
              0%, 100% { transform: translate(0, 0) rotate(-10deg); }
              25% { transform: translate(15px, -20px) rotate(-5deg); }
              50% { transform: translate(-25px, 15px) rotate(-15deg); }
              75% { transform: translate(20px, 10px) rotate(-8deg); }
            }
            @keyframes floatAround6 {
              0%, 100% { transform: translate(0, 0) rotate(15deg); }
              33% { transform: translate(-12px, -15px) rotate(20deg); }
              66% { transform: translate(25px, 20px) rotate(10deg); }
            }
            @keyframes driftSlow {
              0%, 100% { transform: translate(0, 0) rotate(35deg); }
              25% { transform: translate(-25px, 15px) rotate(40deg); }
              50% { transform: translate(15px, -25px) rotate(30deg); }
              75% { transform: translate(-8px, 30px) rotate(38deg); }
            }
            @keyframes gentleDrift {
              0%, 100% { transform: translate(0, 0) rotate(-20deg); }
              50% { transform: translate(20px, -30px) rotate(-15deg); }
            }
            .floating-symbol {
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;
            }
            .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
            .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
            .floating-symbol:nth-child(3) { animation: floatAround3 10s infinite; animation-delay: -4s; }
            .floating-symbol:nth-child(4) { animation: floatAround4 18s infinite; animation-delay: -6s; }
            .floating-symbol:nth-child(5) { animation: floatAround5 14s infinite; animation-delay: -1s; }
            .floating-symbol:nth-child(6) { animation: floatAround6 11s infinite; animation-delay: -5s; }
            .floating-symbol:nth-child(7) { animation: driftSlow 20s infinite; animation-delay: -8s; }
            .floating-symbol:nth-child(8) { animation: gentleDrift 16s infinite; animation-delay: -3s; }
          `}
        </style>
        
        {/* Background Code Symbols */}
        <div style={styles.backgroundSymbols}>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '25%', top: '15%', color: '#2E3344', transform: 'rotate(-15deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '75%', top: '30%', color: '#ABB5CE', transform: 'rotate(20deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '15%', top: '45%', color: '#6C758E', transform: 'rotate(-25deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '85%', top: '60%', color: '#292A2E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '35%', top: '75%', color: '#3A4158', transform: 'rotate(-10deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '65%', top: '85%', color: '#5A6B8C', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '10%', top: '25%', color: '#4F5A7A', transform: 'rotate(35deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '90%', top: '40%', color: '#8A94B8', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
        </div>
        <div style={styles.header}>
          <div style={styles.loading}>Loading project...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.sidebar}>
      {/* Floating Animation CSS */}
      <style>
        {`
          @keyframes floatAround1 {
            0%, 100% { transform: translate(0, 0) rotate(-15deg); }
            25% { transform: translate(20px, -15px) rotate(-10deg); }
            50% { transform: translate(-10px, 20px) rotate(-20deg); }
            75% { transform: translate(15px, 5px) rotate(-12deg); }
          }
          @keyframes floatAround2 {
            0%, 100% { transform: translate(0, 0) rotate(20deg); }
            33% { transform: translate(-20px, 10px) rotate(25deg); }
            66% { transform: translate(25px, -8px) rotate(15deg); }
          }
          @keyframes floatAround3 {
            0%, 100% { transform: translate(0, 0) rotate(-25deg); }
            20% { transform: translate(-15px, -20px) rotate(-20deg); }
            40% { transform: translate(20px, 15px) rotate(-30deg); }
            60% { transform: translate(-8px, -10px) rotate(-22deg); }
            80% { transform: translate(12px, 18px) rotate(-28deg); }
          }
          @keyframes floatAround4 {
            0%, 100% { transform: translate(0, 0) rotate(30deg); }
            50% { transform: translate(-30px, 25px) rotate(35deg); }
          }
          @keyframes floatAround5 {
            0%, 100% { transform: translate(0, 0) rotate(-10deg); }
            25% { transform: translate(15px, -20px) rotate(-5deg); }
            50% { transform: translate(-25px, 15px) rotate(-15deg); }
            75% { transform: translate(20px, 10px) rotate(-8deg); }
          }
          @keyframes floatAround6 {
            0%, 100% { transform: translate(0, 0) rotate(15deg); }
            33% { transform: translate(-12px, -15px) rotate(20deg); }
            66% { transform: translate(25px, 20px) rotate(10deg); }
          }
          @keyframes driftSlow {
            0%, 100% { transform: translate(0, 0) rotate(35deg); }
            25% { transform: translate(-25px, 15px) rotate(40deg); }
            50% { transform: translate(15px, -25px) rotate(30deg); }
            75% { transform: translate(-8px, 30px) rotate(38deg); }
          }
          @keyframes gentleDrift {
            0%, 100% { transform: translate(0, 0) rotate(-20deg); }
            50% { transform: translate(20px, -30px) rotate(-15deg); }
          }
          .floating-symbol {
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
          .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
          .floating-symbol:nth-child(3) { animation: floatAround3 10s infinite; animation-delay: -4s; }
          .floating-symbol:nth-child(4) { animation: floatAround4 18s infinite; animation-delay: -6s; }
          .floating-symbol:nth-child(5) { animation: floatAround5 14s infinite; animation-delay: -1s; }
          .floating-symbol:nth-child(6) { animation: floatAround6 11s infinite; animation-delay: -5s; }
          .floating-symbol:nth-child(7) { animation: driftSlow 20s infinite; animation-delay: -8s; }
          .floating-symbol:nth-child(8) { animation: gentleDrift 16s infinite; animation-delay: -3s; }
        `}
      </style>
      
      {/* Background Code Symbols */}
      <div style={styles.backgroundSymbols}>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '25%', top: '15%', color: '#2E3344', transform: 'rotate(-15deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '75%', top: '30%', color: '#ABB5CE', transform: 'rotate(20deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '15%', top: '45%', color: '#6C758E', transform: 'rotate(-25deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '85%', top: '60%', color: '#292A2E', transform: 'rotate(30deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '35%', top: '75%', color: '#3A4158', transform: 'rotate(-10deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '65%', top: '85%', color: '#5A6B8C', transform: 'rotate(15deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '10%', top: '25%', color: '#4F5A7A', transform: 'rotate(35deg)'
        }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{
          ...styles.codeSymbol,
          left: '90%', top: '40%', color: '#8A94B8', transform: 'rotate(-20deg)'
        }}>&#60;/&#62;</div>
      </div>

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
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.color = '#9ca3af';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={styles.projectDetails}>
            <h1 style={styles.projectTitle}>
              {project?.title || 'Project Workspace'}
            </h1>
            {project?.status && (
              <div style={{
                ...styles.projectBadge,
                backgroundColor: project.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 
                               project.status === 'completed' ? 'rgba(59, 130, 246, 0.15)' : 
                               'rgba(107, 114, 128, 0.15)',
                color: project.status === 'active' ? '#22c55e' : 
                       project.status === 'completed' ? '#60a5fa' : '#9ca3af',
                borderColor: project.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 
                            project.status === 'completed' ? 'rgba(59, 130, 246, 0.3)' : 
                            'rgba(107, 114, 128, 0.3)'
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
                <IconComponent size={20} style={styles.navIcon} />
                <span style={styles.navLabel}>{item.label}</span>
              </div>
            );
          })}
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
                <IconComponent size={20} style={styles.navIcon} />
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
              e.target.style.transform = 'translateY(0)';
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
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#60a5fa';
              }}
            >
              <ExternalLink size={16} style={styles.menuItemIcon} />
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
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#f87171';
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

export default ProjectSidebar;