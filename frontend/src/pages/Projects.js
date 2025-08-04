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
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'joined', 'starred'
  const [showCreateProject, setShowCreateProject] = useState(false);

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
      // TODO: Implement starred projects API endpoint
      // For now, using empty array as placeholder
      setStarredProjects([]);
    } catch (err) {
      console.error('Error fetching starred projects:', err);
    }
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

  const handleStarProject = async (projectId) => {
    try {
      // TODO: Implement star/unstar project API
      console.log('Star/unstar project:', projectId);
      // For now, just show alert
      alert('Star functionality will be implemented soon!');
    } catch (err) {
      console.error('Error starring project:', err);
    }
  };

  const ProjectCard = ({ project }) => {
    const isOwner = project.owner_id === user?.id;
    const isStarred = starredProjects.some(p => p.id === project.id);

    return (
      <div style={styles.projectCard}>
        <div style={styles.cardHeader}>
          <h3 style={styles.projectTitle}>{project.title}</h3>
          <div style={styles.cardHeaderActions}>
            <button
              style={{
                ...styles.starButton,
                color: isStarred ? '#ffc107' : '#6c757d'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleStarProject(project.id);
              }}
              title={isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              {isStarred ? '★' : '☆'}
            </button>
            <span 
              style={{
                ...styles.badge,
                backgroundColor: getStatusColor(project.status)
              }}
            >
              {project.status?.toUpperCase()}
            </span>
          </div>
        </div>

        <p style={styles.projectDescription}>
          {project.description && project.description.length > 120 
            ? `${project.description.substring(0, 120)}...` 
            : project.description || 'No description available'
          }
        </p>

        <div style={styles.projectMeta}>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Difficulty:</span>
            <span 
              style={{
                ...styles.difficultyBadge,
                backgroundColor: getDifficultyColor(project.difficulty_level)
              }}
            >
              {project.difficulty_level?.toUpperCase() || 'N/A'}
            </span>
          </div>

          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Experience:</span>
            <span style={styles.metaValue}>
              {project.required_experience_level?.charAt(0).toUpperCase() + 
               project.required_experience_level?.slice(1) || 'Any'}
            </span>
          </div>

          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Team Size:</span>
            <span style={styles.metaValue}>
              {project.current_members || 0}/{project.maximum_members || 'N/A'} members
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

        {/* Programming Languages */}
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

        {/* Topics */}
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
    // Refresh projects after creating
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    cardHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    projectTitle: {
      color: '#333',
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0',
      flex: 1,
      marginRight: '10px'
    },
    starButton: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
      textTransform: 'uppercase'
    },
    projectDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '15px',
      margin: '0 0 15px 0'
    },
    projectMeta: {
      marginBottom: '15px'
    },
    metaRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px'
    },
    metaLabel: {
      fontSize: '13px',
      color: '#6c757d',
      fontWeight: '500'
    },
    metaValue: {
      fontSize: '13px',
      color: '#495057',
      fontWeight: '500'
    },
    difficultyBadge: {
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white'
    },
    tagsSection: {
      marginBottom: '12px'
    },
    tagLabel: {
      fontSize: '12px',
      color: '#6c757d',
      fontWeight: '500',
      marginRight: '8px'
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginTop: '4px'
    },
    languageTag: {
      padding: '3px 8px',
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500'
    },
    topicTag: {
      padding: '3px 8px',
      backgroundColor: '#6f42c1',
      color: 'white',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500'
    },
    moreTag: {
      padding: '3px 8px',
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: '1px solid #e9ecef'
    },
    ownerInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    ownerLabel: {
      fontSize: '12px',
      color: '#6c757d'
    },
    ownerName: {
      fontSize: '13px',
      color: '#495057',
      fontWeight: '500'
    },
    cardActions: {
      display: 'flex',
      gap: '8px'
    },
    viewButton: {
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    },
    errorContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      color: '#dc3545'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    },
    emptyStateTitle: {
      fontSize: '24px',
      marginBottom: '10px',
      color: '#495057'
    },
    emptyStateText: {
      fontSize: '16px',
      marginBottom: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h3>Loading your projects...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3>{error}</h3>
      </div>
    );
  }

  const displayProjects = getDisplayProjects();

  return (
    <div style={styles.container}>
      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProject onClose={handleCloseCreateProject} />
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Projects</h1>
        <button 
          style={styles.createButton}
          onClick={handleCreateProject}
        >
          <span>+</span>
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
          My Projects ({myProjects.length})
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'joined' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('joined')}
        >
          Joined Projects ({joinedProjects.length})
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'starred' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('starred')}
        >
          Starred Projects ({starredProjects.length})
        </button>
      </div>

      {/* Projects Grid */}
      {displayProjects.length > 0 ? (
        <div style={styles.projectsGrid}>
          {displayProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyStateTitle}>
            {activeTab === 'my' 
              ? 'No projects created yet' 
              : activeTab === 'joined' 
                ? 'No projects joined yet' 
                : 'No starred projects yet'
            }
          </h2>
          <p style={styles.emptyStateText}>
            {activeTab === 'my' 
              ? 'Create your first project to start collaborating with other developers!' 
              : activeTab === 'joined' 
                ? 'Join projects created by other developers to contribute and learn.' 
                : 'Star projects you find interesting to keep track of them here.'
            }
          </p>
          {activeTab === 'my' && (
            <button 
              style={styles.createButton}
              onClick={handleCreateProject}
            >
              <span>+</span>
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Projects;