// frontend/src/pages/soloproject/SoloProjectInfo.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; // Removed unused import
import { projectService } from '../../services/projectService';

function SoloProjectInfo() {
  const { projectId } = useParams();
  // const { user } = useAuth(); // Removed unused variable
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await projectService.getProjectById(projectId);
        
        if (response.success) {
          setProject(response.data.project);
          setEditedProject(response.data.project);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project information');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProject({ ...project });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProject({ ...project });
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const response = await projectService.updateProject(projectId, {
        title: editedProject.title,
        description: editedProject.description,
        detailed_description: editedProject.detailed_description,
        github_repo_url: editedProject.github_repo_url,
        deadline: editedProject.deadline
      });

      if (response.success) {
        setProject(editedProject);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project information');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'completed': return '#6f42c1';
      case 'paused': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#fd7e14';
      case 'expert': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1000px',
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
      fontSize: '28px',
      margin: '0 0 8px 0',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    editButton: {
      backgroundColor: '#6f42c1',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginRight: '8px'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      color: '#721c24',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    loadingState: {
      textAlign: 'center',
      padding: '60px',
      color: '#6c757d'
    },
    infoGrid: {
      display: 'grid',
      gap: '24px'
    },
    infoSection: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      overflow: 'hidden'
    },
    sectionHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    sectionIcon: {
      fontSize: '20px'
    },
    sectionContent: {
      padding: '24px'
    },
    fieldGrid: {
      display: 'grid',
      gap: '20px'
    },
    fieldRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    field: {
      marginBottom: '20px'
    },
    fieldLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px',
      display: 'block'
    },
    fieldValue: {
      fontSize: '16px',
      color: '#333',
      lineHeight: '1.5'
    },
    fieldInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    fieldTextarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '16px',
      lineHeight: '1.5',
      minHeight: '120px',
      resize: 'vertical'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'white',
      textTransform: 'capitalize'
    },
    difficultyBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'white',
      textTransform: 'capitalize'
    },
    metaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    },
    metaItem: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    metaNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#6f42c1',
      margin: '0 0 8px 0'
    },
    metaLabel: {
      fontSize: '14px',
      color: '#6c757d',
      margin: 0
    },
    linkButton: {
      color: '#6f42c1',
      textDecoration: 'none',
      padding: '8px 16px',
      border: '1px solid #6f42c1',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'inline-block'
    },
    linkButtonHover: {
      backgroundColor: '#6f42c1',
      color: 'white'
    },
    progressSection: {
      marginTop: '20px'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: '#e9ecef',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#6f42c1',
      transition: 'width 0.3s ease'
    },
    progressText: {
      fontSize: '14px',
      color: '#6c757d',
      textAlign: 'center',
      marginTop: '8px'
    },
    technologiesGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    technologyTag: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500'
    },
    descriptionText: {
      fontSize: '16px',
      color: '#333',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>Loading project information...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>Project not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Information</h1>
          <p style={styles.subtitle}>Manage your solo project details and settings</p>
        </div>
        <div>
          {isEditing ? (
            <>
              <button
                style={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                style={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              style={styles.editButton}
              onClick={handleEdit}
            >
              Edit Project
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}

      {/* Info Grid */}
      <div style={styles.infoGrid}>
        {/* Basic Information */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📋</span>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.fieldGrid}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Project Title</label>
                {isEditing ? (
                  <input
                    style={styles.fieldInput}
                    type="text"
                    value={editedProject.title || ''}
                    onChange={(e) => setEditedProject({
                      ...editedProject,
                      title: e.target.value
                    })}
                  />
                ) : (
                  <div style={styles.fieldValue}>{project.title}</div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Description</label>
                {isEditing ? (
                  <textarea
                    style={styles.fieldTextarea}
                    value={editedProject.description || ''}
                    onChange={(e) => setEditedProject({
                      ...editedProject,
                      description: e.target.value
                    })}
                    placeholder="Brief description of your project..."
                  />
                ) : (
                  <div style={styles.descriptionText}>
                    {project.description || 'No description provided'}
                  </div>
                )}
              </div>

              {(project.detailed_description || isEditing) && (
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Detailed Description</label>
                  {isEditing ? (
                    <textarea
                      style={{...styles.fieldTextarea, minHeight: '200px'}}
                      value={editedProject.detailed_description || ''}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        detailed_description: e.target.value
                      })}
                      placeholder="Detailed project description, goals, and requirements..."
                    />
                  ) : (
                    <div style={styles.descriptionText}>
                      {project.detailed_description}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Status & Metadata */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📊</span>
            <h3 style={styles.sectionTitle}>Project Status</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Status</label>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(project.status)
                  }}
                >
                  {project.status || 'Active'}
                </span>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Difficulty Level</label>
                <span
                  style={{
                    ...styles.difficultyBadge,
                    backgroundColor: getDifficultyColor(project.difficulty_level)
                  }}
                >
                  {project.difficulty_level || 'Medium'}
                </span>
              </div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Created</label>
                <div style={styles.fieldValue}>{formatDate(project.created_at)}</div>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Last Updated</label>
                <div style={styles.fieldValue}>{formatDate(project.updated_at)}</div>
              </div>
            </div>

            {(project.deadline || isEditing) && (
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Deadline</label>
                {isEditing ? (
                  <input
                    style={styles.fieldInput}
                    type="date"
                    value={editedProject.deadline ? 
                      new Date(editedProject.deadline).toISOString().split('T')[0] : 
                      ''
                    }
                    onChange={(e) => setEditedProject({
                      ...editedProject,
                      deadline: e.target.value
                    })}
                  />
                ) : (
                  <div style={styles.fieldValue}>{formatDate(project.deadline)}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Repository Information */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🔗</span>
            <h3 style={styles.sectionTitle}>Repository & Links</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>GitHub Repository</label>
              {isEditing ? (
                <input
                  style={styles.fieldInput}
                  type="url"
                  value={editedProject.github_repo_url || ''}
                  onChange={(e) => setEditedProject({
                    ...editedProject,
                    github_repo_url: e.target.value
                  })}
                  placeholder="https://github.com/username/repository"
                />
              ) : (
                project.github_repo_url ? (
                  <a
                    href={project.github_repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.linkButton}
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, styles.linkButtonHover);
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6f42c1';
                    }}
                  >
                    View on GitHub →
                  </a>
                ) : (
                  <div style={styles.fieldValue}>No repository linked</div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Project Statistics */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📈</span>
            <h3 style={styles.sectionTitle}>Project Overview</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <div style={styles.metaNumber}>1</div>
                <div style={styles.metaLabel}>Solo Developer</div>
              </div>
              
              <div style={styles.metaItem}>
                <div style={styles.metaNumber}>
                  {project.estimated_duration_weeks || '—'}
                </div>
                <div style={styles.metaLabel}>Estimated Weeks</div>
              </div>
              
              <div style={styles.metaItem}>
                <div style={styles.metaNumber}>
                  {Math.floor(Math.random() * 50) + 25}%
                </div>
                <div style={styles.metaLabel}>Progress</div>
              </div>
              
              <div style={styles.metaItem}>
                <div style={styles.metaNumber}>
                  {Math.floor((new Date() - new Date(project.created_at)) / (1000 * 60 * 60 * 24))}
                </div>
                <div style={styles.metaLabel}>Days Active</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${Math.floor(Math.random() * 50) + 25}%`
                  }}
                />
              </div>
              <div style={styles.progressText}>
                Overall project completion
              </div>
            </div>
          </div>
        </div>

        {/* Technologies (if available) */}
        {project.technologies && project.technologies.length > 0 && (
          <div style={styles.infoSection}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🛠️</span>
              <h3 style={styles.sectionTitle}>Technologies</h3>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.technologiesGrid}>
                {project.technologies.map((tech, index) => (
                  <span key={index} style={styles.technologyTag}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SoloProjectInfo;