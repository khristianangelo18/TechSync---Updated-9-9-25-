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

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getUserProjects();
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
        return userProjects.filter(p => p.owner_id === user?.id);
      case 'joined':
        return userProjects.filter(p => p.owner_id !== user?.id);
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
    const isOwner = project.owner_id === user?.id;

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
            {project.difficulty_level && (
              <span 
                style={{
                  ...styles.difficultyBadge,
                  backgroundColor: getDifficultyColor(project.difficulty_level)
                }}
              >
                {project.difficulty_level?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div style={styles.cardDescription}>
          {project.description}
        </div>

        <div style={styles.projectMeta}>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Members:</span>
            <span style={styles.metaValue}>
              {project.current_members || 1}/{project.maximum_members || 10}
            </span>
          </div>

          {project.estimated_duration_weeks && (
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Duration:</span>
              <span style={styles.metaValue}>
                {project.estimated_duration_weeks} weeks
              </span>
            </div>
          )}

          {!isOwner && (
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Role:</span>
              <span style={styles.metaValue}>
                {project.user_role?.charAt(0).toUpperCase() + project.user_role?.slice(1) || 'Member'}
              </span>
            </div>
          )}
        </div>

        {project.project_languages && project.project_languages.length > 0 && (
          <div style={styles.tagsSection}>
            <span style={styles.tagLabel}>Languages:</span>
            <div style={styles.tags}>
              {project.project_languages.slice(0, 3).map((lang, index) => (
                <span key={index} style={styles.languageTag}>
                  {lang.programming_languages?.name || lang.name}
                </span>
              ))}
              {project.project_languages.length > 3 && (
                <span style={styles.moreTag}>
                  +{project.project_languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {project.project_topics && project.project_topics.length > 0 && (
          <div style={styles.tagsSection}>
            <span style={styles.tagLabel}>Topics:</span>
            <div style={styles.tags}>
              {project.project_topics.slice(0, 2).map((topic, index) => (
                <span key={index} style={styles.topicTag}>
                  {topic.topics?.name || topic.name}
                </span>
              ))}
              {project.project_topics.length > 2 && (
                <span style={styles.moreTag}>
                  +{project.project_topics.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        <div style={styles.cardFooter}>
          <div style={styles.ownerInfo}>
            <span style={styles.ownerLabel}>
              {isOwner ? 'You' : 'By:'}
            </span>
            {!isOwner && (
              <span style={styles.ownerName}>
                {project.users?.full_name || project.users?.username || 'Anonymous'}
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
    fetchUserProjects();
  };

  const myProjects = userProjects.filter(p => p.owner_id === user?.id);
  const joinedProjects = userProjects.filter(p => p.owner_id !== user?.id);

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
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '25px',
      marginBottom: '30px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
      marginBottom: '8px',
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
      fontWeight: 'bold',
      color: 'white',
      textTransform: 'uppercase'
    },
    difficultyBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
      textTransform: 'uppercase'
    },
    cardDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '20px'
    },
    projectMeta: {
      marginBottom: '20px'
    },
    metaRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '14px'
    },
    metaLabel: {
      color: '#888',
      fontWeight: '500'
    },
    metaValue: {
      color: '#333',
      fontWeight: '600'
    },
    tagsSection: {
      marginBottom: '15px'
    },
    tagLabel: {
      fontSize: '12px',
      color: '#888',
      fontWeight: '600',
      marginBottom: '8px',
      display: 'block'
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    languageTag: {
      backgroundColor: '#e3f2fd',
      color: '#1565c0',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    topicTag: {
      backgroundColor: '#f3e5f5',
      color: '#7b1fa2',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    moreTag: {
      backgroundColor: '#f5f5f5',
      color: '#666',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      paddingTop: '15px',
      borderTop: '1px solid #f0f0f0'
    },
    ownerInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px'
    },
    ownerLabel: {
      color: '#888',
      fontWeight: '500'
    },
    ownerName: {
      color: '#333',
      fontWeight: '600'
    },
    cardActions: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    viewButton: {
      padding: '8px 16px',
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
      padding: '8px 12px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666'
    },
    loading: {
      textAlign: 'center',
      padding: '60px 20px',
      fontSize: '18px',
      color: '#666'
    },
    error: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#dc3545',
      fontSize: '16px'
    },
    // Delete confirmation modal styles
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
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '30px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
          { key: 'my', label: `My Projects (${myProjects.length})` },
          { key: 'joined', label: `Joined Projects (${joinedProjects.length})` },
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Project</h2>
              <div style={styles.modalMessage}>
                Are you sure you want to delete <span style={styles.projectTitle}>"{deleteConfirm.project?.title}"</span>?
                <br /><br />
                This action cannot be undone. All project data, members, and related information will be permanently deleted.
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button
                style={{
                  ...styles.cancelButton,
                  ...(deleting ? styles.disabledButton : {})
                }}
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

      {showCreateProject && (
        <CreateProject onClose={handleCloseCreateProject} />
      )}
    </div>
  );
}

export default Projects;