// frontend/src/pages/Projects.js - ALIGNED WITH DASHBOARD THEME
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import CreateProject from './CreateProject';
import { Plus, User, Calendar, Users, Code } from 'lucide-react';

function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'joined', 'starred'
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, project: null });
  const [deleting, setDeleting] = useState(false);

  // Color variants for project cards - matching dashboard
  const colorVariants = ['slate', 'zinc', 'neutral', 'stone', 'gray', 'blue'];

  // Fetch user projects
  useEffect(() => {
    fetchUserProjects();
  }, []);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectService.getUserProjects();
      
      if (response.success) {
        setUserProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Updated handleViewProject with solo project detection
  const handleViewProject = (project) => {
    // Check if this is a solo project (1/1 members)
    const isSoloProject = project.maximum_members === 1 && project.current_members === 1;
    
    if (isSoloProject) {
      // Route to solo project workspace
      navigate(`/soloproject/${project.id}/dashboard`);
    } else {
      // Route to regular project workspace  
      navigate(`/project/${project.id}/dashboard`);
    }
  };

  const handleDeleteProject = (project) => {
    setDeleteConfirm({ show: true, project });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.project) return;

    try {
      setDeleting(true);
      const response = await projectService.deleteProject(deleteConfirm.project.id);
      
      if (response.success) {
        // Remove project from local state
        setUserProjects(prev => prev.filter(p => p.id !== deleteConfirm.project.id));
        setDeleteConfirm({ show: false, project: null });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, project: null });
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreateProject = () => {
    setShowCreateProject(false);
    fetchUserProjects(); // Refresh projects after creating
  };

  // Filter projects by tab
  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'my':
        return userProjects.filter(p => 
          p.owner_id === user?.id || 
          (p.membership && p.membership.role === 'owner')
        );
      case 'joined':
        return userProjects.filter(p => 
          p.owner_id !== user?.id && 
          p.membership && 
          p.membership.role !== 'owner'
        );
      case 'starred':
        return userProjects.filter(p => p.is_starred);
      default:
        return userProjects;
    }
  };

  const filteredProjects = getFilteredProjects();

  // Better calculation of project counts
  const myProjectsCount = userProjects.filter(p => 
    p.owner_id === user?.id || 
    (p.membership && p.membership.role === 'owner')
  ).length;

  const joinedProjectsCount = userProjects.filter(p => 
    p.owner_id !== user?.id && 
    p.membership && 
    p.membership.role !== 'owner'
  ).length;

  const starredProjectsCount = userProjects.filter(p => p.is_starred).length;

  const getDifficultyStyle = (difficulty) => {
    const colors = {
      easy: '#22c55e',
      medium: '#f59e0b', 
      hard: '#ef4444'
    };
    
    return {
      backgroundColor: colors[difficulty?.toLowerCase()] || colors.medium,
      color: 'white',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '11px',
      fontWeight: 'bold'
    };
  };

  // Enhanced project card rendering with dashboard-style containers
  const renderProjectCard = (project, index) => {
    const isOwner = project.owner_id === user?.id || 
                    (project.membership && project.membership.role === 'owner');
    const isSoloProject = project.maximum_members === 1 && project.current_members === 1;
    
    // Get color variant styles matching dashboard
    const colorVariant = colorVariants[index % colorVariants.length];
    const cardColorStyles = styles.projectCardVariants[colorVariant] || styles.projectCardVariants.slate;

    return (
      <div 
        key={project.id} 
        style={{
          ...styles.projectCard,
          ...cardColorStyles.base
        }}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, cardColorStyles.hover);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, cardColorStyles.base);
        }}
      >
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{project.title}</h3>
          <div style={styles.cardMeta}>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: project.status === 'active' ? '#28a745' : 
                             project.status === 'completed' ? '#007bff' : '#6c757d'
            }}>
              {project.status}
            </span>
            
            {/* Solo Project Indicator */}
            {isSoloProject && (
              <span style={{
                ...styles.soloProjectBadge,
                ...cardColorStyles.highlightChip
              }}>
                👤 Solo
              </span>
            )}
            
            <span style={getDifficultyStyle(project.difficulty_level)}>
              {(project.difficulty_level || 'Medium').toUpperCase()}
            </span>
          </div>
        </div>
        
        <div style={styles.cardContent}>
          <p style={styles.cardDescription}>
            {project.description?.substring(0, 120)}
            {project.description?.length > 120 && '...'}
          </p>
          
          <div style={styles.cardDetails}>
            <div style={styles.memberCount}>
              {isSoloProject ? '👤 Solo Project' : `${project.current_members || 0}/${project.maximum_members || 0} members`}
            </div>
            
            {project.project_languages && project.project_languages.length > 0 && (
              <div style={styles.tagsContainer}>
                {project.project_languages
                  .slice(0, 3)
                  .map((lang, langIndex) => (
                    <span key={langIndex} style={styles.tag}>
                      {lang.programming_languages?.name || 'Unknown'}
                    </span>
                  ))}
                {project.project_languages.length > 3 && (
                  <span style={styles.tag}>
                    +{project.project_languages.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={styles.cardFooter}>
            <span style={styles.ownerText}>
              {isOwner ? 'You' : 'By:'}
            </span>
            {!isOwner && (
              <span style={styles.ownerName}>
                {project.users?.full_name || project.users?.username || 'Anonymous'}
              </span>
            )}
            {/* Show membership info for joined projects */}
            {!isOwner && project.membership && (
              <span style={styles.membershipInfo}>
                (Joined as {project.membership.role})
              </span>
            )}
          </div>
          
          <div style={styles.cardActions}>
            <button 
              style={{
                ...styles.viewButton,
                ...cardColorStyles.joinButton,
                ...(isSoloProject ? styles.soloViewButton : {})
              }}
              onClick={() => handleViewProject(project)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = cardColorStyles.joinButtonHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = cardColorStyles.joinButton.backgroundColor;
              }}
            >
              {isSoloProject ? 'Open Solo Workspace' : (isOwner ? 'Manage Project' : 'Enter Workspace')}
            </button>
            
            {/* Add delete button for project owners */}
            {isOwner && (
              <button 
                style={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project);
                }}
                title="Delete Project"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c53030';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px',
      marginLeft: '-150px'
    },
    backgroundSymbols: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    createButton: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    tabsContainer: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      marginBottom: '25px',
      gap: '12px'
    },
    tab: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      color: '#E8EDF9',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    activeTab: {
      backgroundColor: '#1a1d24',
      color: '#E8EDF9'
    },
    tabCount: {
      padding: '2px 6px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#d1d5db',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    activeTabCount: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    projectsGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      marginTop: '20px'
    },
    projectCard: {
      borderRadius: '16px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    // Subtle color variants for project cards - aligned with dashboard
    projectCardVariants: {
      slate: {
        base: {
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
          border: '1px solid rgba(51, 65, 85, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(51, 65, 85, 0.25)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.18), rgba(30, 41, 59, 0.12))'
        },
        highlightChip: {
          backgroundColor: 'rgba(51, 65, 85, 0.2)',
          color: '#94a3b8',
          border: '1px solid rgba(51, 65, 85, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      zinc: {
        base: {
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.12), rgba(39, 39, 42, 0.08))',
          border: '1px solid rgba(63, 63, 70, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(63, 63, 70, 0.25)',
          border: '1px solid rgba(63, 63, 70, 0.4)',
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.18), rgba(39, 39, 42, 0.12))'
        },
        highlightChip: {
          backgroundColor: 'rgba(63, 63, 70, 0.2)',
          color: '#a1a1aa',
          border: '1px solid rgba(63, 63, 70, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      neutral: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        },
        highlightChip: {
          backgroundColor: 'rgba(64, 64, 64, 0.2)',
          color: '#a3a3a3',
          border: '1px solid rgba(64, 64, 64, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      stone: {
        base: {
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.12), rgba(41, 37, 36, 0.08))',
          border: '1px solid rgba(68, 64, 60, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(68, 64, 60, 0.25)',
          border: '1px solid rgba(68, 64, 60, 0.4)',
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.18), rgba(41, 37, 36, 0.12))'
        },
        highlightChip: {
          backgroundColor: 'rgba(68, 64, 60, 0.2)',
          color: '#a8a29e',
          border: '1px solid rgba(68, 64, 60, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      gray: {
        base: {
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.12), rgba(31, 41, 55, 0.08))',
          border: '1px solid rgba(55, 65, 81, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(55, 65, 81, 0.25)',
          border: '1px solid rgba(55, 65, 81, 0.4)',
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.18), rgba(31, 41, 55, 0.12))'
        },
        highlightChip: {
          backgroundColor: 'rgba(55, 65, 81, 0.2)',
          color: '#9ca3af',
          border: '1px solid rgba(55, 65, 81, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      blue: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        },
        highlightChip: {
          backgroundColor: 'rgba(64, 64, 64, 0.2)',
          color: '#a3a3a3',
          border: '1px solid rgba(64, 64, 64, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      }
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '15px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px 0',
      flex: 1,
      lineHeight: '1.3'
    },
    cardMeta: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      color: 'white',
      textTransform: 'uppercase'
    },
    soloProjectBadge: {
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    cardContent: {
      marginBottom: '15px'
    },
    cardDescription: {
      color: '#d1d5db',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '16px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    cardDetails: {
      marginBottom: '15px'
    },
    memberCount: {
      color: '#9ca3af',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '8px'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    tag: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#d1d5db',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      marginBottom: '15px',
      fontSize: '14px',
      color: '#9ca3af'
    },
    ownerText: {
      fontWeight: '500'
    },
    ownerName: {
      color: '#d1d5db'
    },
    membershipInfo: {
      color: '#10b981',
      fontWeight: '500',
      fontSize: '12px'
    },
    cardActions: {
      display: 'flex',
      gap: '10px'
    },
    viewButton: {
      flex: 1,
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    soloViewButton: {
      backgroundColor: '#6f42c1'
    },
    deleteButton: {
      padding: '12px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    loading: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '16px',
      color: '#9ca3af'
    },
    error: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '16px',
      color: '#ef4444'
    },
    emptyState: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: 0.5
    },
    emptyStateText: {
      fontSize: '18px',
      marginBottom: '10px',
      fontWeight: '500',
      color: 'white'
    },
    emptyStateSubtext: {
      fontSize: '14px'
    },
    // Modal styles for delete confirmation
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: '#1a1c20',
      padding: '30px',
      borderRadius: '12px',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalHeader: {
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '10px'
    },
    modalMessage: {
      fontSize: '14px',
      color: '#d1d5db',
      lineHeight: '1.5'
    },
    projectTitle: {
      fontWeight: 'bold',
      color: 'white'
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    confirmButton: {
      padding: '10px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        {/* Background Code Symbols */}
        <div style={styles.backgroundSymbols}>
          <div style={{
            ...styles.codeSymbol,
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
        </div>

        <div style={styles.loading}>Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        {/* Background Code Symbols */}
        <div style={styles.backgroundSymbols}>
          <div style={{
            ...styles.codeSymbol,
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
        </div>

        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Code Symbols */}
      <div style={styles.backgroundSymbols}>
        <div style={{
          ...styles.codeSymbol,
          left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
        }}>&#60;/&#62;</div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Code size={28} style={{ color: '#3b82f6' }} />
          My Projects
        </h1>
        <button
          style={styles.createButton}
          onClick={handleCreateProject}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <Plus size={18} />
          Create Project
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'my' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('my')}
        >
          <User size={16} />
          My Projects
          <span style={{
            ...styles.tabCount,
            ...(activeTab === 'my' ? styles.activeTabCount : {})
          }}>
            {myProjectsCount}
          </span>
        </button>
        
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'joined' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('joined')}
        >
          <Users size={16} />
          Joined Projects
          <span style={{
            ...styles.tabCount,
            ...(activeTab === 'joined' ? styles.activeTabCount : {})
          }}>
            {joinedProjectsCount}
          </span>
        </button>
        
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'starred' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('starred')}
        >
          ⭐ Starred
          <span style={{
            ...styles.tabCount,
            ...(activeTab === 'starred' ? styles.activeTabCount : {})
          }}>
            {starredProjectsCount}
          </span>
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div style={styles.projectsGrid}>
          {filteredProjects.map((project, index) => renderProjectCard(project, index))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>
            {activeTab === 'my' ? '📁' : activeTab === 'joined' ? '👥' : '⭐'}
          </div>
          <div style={styles.emptyStateText}>
            {activeTab === 'my' && "You haven't created any projects yet"}
            {activeTab === 'joined' && "You haven't joined any projects yet"}
            {activeTab === 'starred' && "You haven't starred any projects yet"}
          </div>
          <p style={styles.emptyStateSubtext}>
            {activeTab === 'my' && "Click 'Create Project' to get started!"}
            {activeTab === 'joined' && "Browse available projects to find one that interests you."}
            {activeTab === 'starred' && "Star projects to save them for later."}
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div style={styles.modal} onClick={handleCloseCreateProject}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <CreateProject onClose={handleCloseCreateProject} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Project</h2>
              <p style={styles.modalMessage}>
                Are you sure you want to delete{' '}
                <span style={styles.projectTitle}>"{deleteConfirm.project?.title}"</span>?
                This action cannot be undone and will permanently remove all project data.
              </p>
            </div>
            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={cancelDelete}
                disabled={deleting}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6b7280';
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.confirmButton,
                  ...(deleting ? styles.disabledButton : {})
                }}
                onClick={confirmDelete}
                disabled={deleting}
                onMouseEnter={(e) => {
                  if (!deleting) e.target.style.backgroundColor = '#c53030';
                }}
                onMouseLeave={(e) => {
                  if (!deleting) e.target.style.backgroundColor = '#dc3545';
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;