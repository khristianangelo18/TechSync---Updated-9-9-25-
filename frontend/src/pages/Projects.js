// Fixed Projects.js component with proper project filtering

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import CreateProject from './CreateProject';

function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProjects, setUserProjects] = useState([]);
  const [starredProjects, setStarredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, project: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserProjects();
    fetchStarredProjects();
  }, []);

   useEffect(() => {
    const handleProjectCreated = (event) => {
      console.log('Project created from AI chat:', event.detail.project);
      
      if (event.detail.project) {
        setUserProjects(prev => [event.detail.project, ...prev]);
        console.log('Project added to My Projects list');
        setError(null);
      }
    };

    window.addEventListener('projectCreated', handleProjectCreated);
    
    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
    };
  }, []);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getUserProjects();
      console.log('User projects response:', response.data.projects); // Debug log
      setUserProjects(response.data.projects || []);
    } catch (err) {
      setError('Failed to fetch your projects');
      console.error('Error fetching user projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStarredProjects = async () => {
    try {
      setStarredProjects([]);
    } catch (err) {
      console.error('Error fetching starred projects:', err);
    }
  };

  const handleDeleteProject = async (project) => {
    setDeleteConfirm({ show: true, project });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.project) return;

    setDeleting(true);
    try {
      await projectService.deleteProject(deleteConfirm.project.id);
      
      // Remove the project from the local state
      setUserProjects(prev => prev.filter(p => p.id !== deleteConfirm.project.id));
      
      // Close the confirmation dialog
      setDeleteConfirm({ show: false, project: null });
      
      // Show success message (you could add a toast notification here)
      alert(`Project "${deleteConfirm.project.title}" has been deleted successfully.`);
      
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, project: null });
  };

  const getDisplayProjects = () => {
    switch (activeTab) {
      case 'my':
        // FIXED: Check both owner_id and membership.role for owned projects
        return userProjects.filter(p => 
          p.owner_id === user?.id || 
          (p.membership && p.membership.role === 'owner')
        );
      case 'joined':
        // FIXED: Check for projects where user is a member but not owner
        return userProjects.filter(p => 
          p.owner_id !== user?.id && 
          p.membership && 
          p.membership.role !== 'owner'
        );
      case 'starred':
        return starredProjects;
      default:
        return [];
    }
  };

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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#28a745',
      medium: '#ffc107',
      hard: '#fd7e14',
      expert: '#dc3545'
    };
    return colors[difficulty] || '#6c757d';
  };

  const renderProjectCard = (project) => {
    // FIXED: Better logic to determine if user is the owner
    const isOwner = project.owner_id === user?.id || 
                   (project.membership && project.membership.role === 'owner');

    return (
      <div key={project.id} style={styles.projectCard}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>{project.title}</div>
          <div style={styles.cardMeta}>
            <span 
              style={{
                ...styles.statusBadge,
                backgroundColor: getStatusColor(project.status)
              }}
            >
              {project.status?.toUpperCase()}
            </span>
            <span 
              style={{
                ...styles.difficultyBadge,
                backgroundColor: getDifficultyColor(project.difficulty_level)
              }}
            >
              {project.difficulty_level?.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={styles.cardContent}>
          <p style={styles.cardDescription}>{project.description}</p>
          
          <div style={styles.cardDetails}>
            <div style={styles.memberCount}>
              {project.current_members || 0}/{project.maximum_members || 0} members
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
            {/* FIXED: Show membership info for joined projects */}
            {!isOwner && project.membership && (
              <span style={styles.membershipInfo}>
                (Joined as {project.membership.role})
              </span>
            )}
          </div>
          
          <div style={styles.cardActions}>
            <button 
              style={styles.viewButton}
              onClick={() => handleViewProject(project.id)}
            >
              {isOwner ? 'Manage Project' : 'Enter Workspace'}
            </button>
            
            {/* Add delete button for project owners */}
            {isOwner && (
              <button 
                style={styles.deleteButton}
                onClick={() => handleDeleteProject(project)}
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

  const handleViewProject = (projectId) => {
    navigate(`/project/${projectId}/dashboard`);
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreateProject = () => {
    setShowCreateProject(false);
    fetchUserProjects(); // Refresh projects after creating
  };

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
      borderBottom: '3px solid transparent',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      color: '#6c757d',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      color: '#007bff',
      borderBottomColor: '#007bff'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '25px',
      marginBottom: '30px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    cardHeader: {
      padding: '20px 20px 15px',
      borderBottom: '1px solid #f8f9fa'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    cardMeta: {
      display: 'flex',
      gap: '10px'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      color: 'white',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    difficultyBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      color: 'white',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    cardContent: {
      padding: '20px'
    },
    cardDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '15px'
    },
    cardDetails: {
      marginBottom: '15px'
    },
    memberCount: {
      fontSize: '14px',
      color: '#6c757d',
      marginBottom: '10px'
    },
    languages: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    languageTag: {
      backgroundColor: '#f8f9fa',
      color: '#495057',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    moreLanguages: {
      color: '#6c757d',
      fontSize: '12px',
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
      margin: '0 0 10px 0'
    },
    modalMessage: {
      fontSize: '16px',
      color: '#666',
      lineHeight: '1.5'
    },
    projectTitle: {
      fontWeight: 'bold',
      color: '#dc3545'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      marginTop: '30px'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    confirmButton: {
      padding: '10px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading your projects...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
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

      <div style={styles.tabsContainer}>
        {[
          { key: 'my', label: `My Projects (${myProjectsCount})` },
          { key: 'joined', label: `Joined Projects (${joinedProjectsCount})` },
          { key: 'starred', label: `Starred (${starredProjects.length})` }
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.projectsGrid}>
        {getDisplayProjects().map(renderProjectCard)}
      </div>

      {getDisplayProjects().length === 0 && (
        <div style={styles.emptyState}>
          <h3>No projects found</h3>
          <p>
            {activeTab === 'my' && "You haven't created any projects yet. Click 'Create Project' to get started!"}
            {activeTab === 'joined' && "You haven't joined any projects yet. Browse available projects to find one that interests you."}
            {activeTab === 'starred' && "You haven't starred any projects yet."}
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