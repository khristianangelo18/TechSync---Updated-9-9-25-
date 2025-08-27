// frontend/src/pages/Projects.js - COMPLETE WITH SOLO PROJECT INTEGRATION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import CreateProject from './CreateProject';

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

  // FIXED: Better calculation of project counts
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

  // Enhanced project card rendering with solo project indicator
  const renderProjectCard = (project) => {
    const isOwner = project.owner_id === user?.id || 
                    (project.membership && project.membership.role === 'owner');
    // const isMember = !!project.membership; // Removed unused variable
    const isSoloProject = project.maximum_members === 1 && project.current_members === 1;

    return (
      <div key={project.id} style={styles.projectCard}>
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
                ...styles.statusBadge,
                backgroundColor: '#6f42c1'
              }}>
                👤 Solo
              </span>
            )}
            
            <span style={{
              ...styles.difficultyBadge,
              backgroundColor: project.difficulty_level === 'easy' ? '#28a745' :
                             project.difficulty_level === 'medium' ? '#ffc107' :
                             project.difficulty_level === 'hard' ? '#fd7e14' : '#6c757d'
            }}>
              {project.difficulty_level || 'Medium'}
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
              <div style={styles.languages}>
                {project.project_languages
                  .slice(0, 3)
                  .map((lang, index) => (
                    <span key={index} style={styles.languageTag}>
                      {lang.programming_languages?.name || 'Unknown'}
                    </span>
                  ))}
                {project.project_languages.length > 3 && (
                  <span style={styles.moreLanguages}>
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
                ...(isSoloProject ? styles.soloViewButton : {})
              }}
              onClick={() => handleViewProject(project)}
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
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      color: '#333',
      margin: 0,
      fontSize: '28px',
      fontWeight: 'bold'
    },
    createButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    tabsContainer: {
      display: 'flex',
      marginBottom: '25px',
      borderBottom: '2px solid #e9ecef'
    },
    tab: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      color: '#6c757d',
      borderBottom: '3px solid transparent',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      color: '#007bff',
      borderBottomColor: '#007bff'
    },
    tabCount: {
      marginLeft: '8px',
      padding: '2px 6px',
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    activeTabCount: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '25px',
      marginTop: '20px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
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
      color: '#333',
      margin: '0 0 8px 0',
      flex: 1
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
    difficultyBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      color: 'white',
      textTransform: 'capitalize'
    },
    cardContent: {
      marginBottom: '15px'
    },
    cardDescription: {
      fontSize: '14px',
      color: '#6c757d',
      lineHeight: '1.5',
      marginBottom: '15px'
    },
    cardDetails: {
      marginBottom: '15px'
    },
    memberCount: {
      fontSize: '14px',
      color: '#495057',
      fontWeight: '500',
      marginBottom: '8px'
    },
    languages: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    languageTag: {
      padding: '2px 6px',
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      fontSize: '11px',
      borderRadius: '10px',
      fontWeight: '500'
    },
    moreLanguages: {
      padding: '2px 6px',
      backgroundColor: '#f5f5f5',
      color: '#666',
      fontSize: '11px',
      borderRadius: '10px',
      fontStyle: 'italic'
    },
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      marginBottom: '15px',
      fontSize: '14px',
      color: '#6c757d'
    },
    ownerText: {
      fontWeight: '500'
    },
    ownerName: {
      color: '#495057'
    },
    membershipInfo: {
      color: '#28a745',
      fontWeight: '500',
      fontSize: '12px'
    },
    cardActions: {
      display: 'flex',
      gap: '10px'
    },
    viewButton: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    soloViewButton: {
      backgroundColor: '#6f42c1',
      borderColor: '#6f42c1'
    },
    deleteButton: {
      padding: '10px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '18px',
      color: '#6c757d'
    },
    error: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '18px',
      color: '#dc3545'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    },
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: 0.5
    },
    emptyStateText: {
      fontSize: '18px',
      marginBottom: '10px',
      fontWeight: '500'
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    modalHeader: {
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    modalMessage: {
      fontSize: '14px',
      color: '#6c757d',
      lineHeight: '1.5'
    },
    projectTitle: {
      fontWeight: 'bold',
      color: '#333'
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    confirmButton: {
      padding: '10px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Projects</h1>
        <button
          style={styles.createButton}
          onClick={handleCreateProject}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#218838';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#28a745';
          }}
        >
          + Create Project
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
          Starred
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
          {filteredProjects.map(renderProjectCard)}
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
        <CreateProject onClose={handleCloseCreateProject} />
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