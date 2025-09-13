// frontend/src/pages/soloproject/SoloProjectInfo.js - ALIGNED WITH DASHBOARD & GOALS THEME
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Info, 
  Edit3, 
  Save, 
  X, 
  Calendar, 
  Clock, 
  BarChart3, 
  Target, 
  TrendingUp, 
  GitBranch, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Pause,
  XCircle,
  User,
  Zap,
  Code,
  FileText
} from 'lucide-react';
import { projectService } from '../../services/projectService';

// Background symbols component - SAME AS DASHBOARD & GOALS
const BackgroundSymbols = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    pointerEvents: 'none'
  }}>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
    }}>&#60;/&#62;</div>
  </div>
);

function SoloProjectInfo() {
  const { projectId } = useParams();
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
      case 'active': return '#10b981';
      case 'completed': return '#a855f7';
      case 'paused': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Zap size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'paused': return <Pause size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#f97316';
      case 'expert': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Target size={16} />;
      case 'medium': return <BarChart3 size={16} />;
      case 'hard': return <TrendingUp size={16} />;
      case 'expert': return <Zap size={16} />;
      default: return <Target size={16} />;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.loadingState}>
          <div>Loading project information...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.errorMessage}>
          <AlertTriangle size={16} style={{ marginRight: '8px' }} />
          Project not found
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Code Symbols */}
      <BackgroundSymbols />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Information</h1>
          <p style={styles.subtitle}>Manage your solo project details and settings</p>
        </div>
        <div>
          {isEditing ? (
            <div style={styles.buttonGroup}>
              <button
                style={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                <Save size={16} style={{ marginRight: '8px' }} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                style={styles.cancelButton}
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(15, 17, 22, 0.95)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={16} style={{ marginRight: '8px' }} />
                Cancel
              </button>
            </div>
          ) : (
            <button
              style={styles.editButton}
              onClick={handleEdit}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
              }}
            >
              <Edit3 size={16} style={{ marginRight: '8px' }} />
              Edit Project
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <AlertTriangle size={16} style={{ marginRight: '8px' }} />
          {error}
        </div>
      )}

      {/* Info Grid */}
      <div style={styles.infoGrid}>
        {/* Basic Information */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <Info size={20} style={styles.sectionIcon} />
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
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
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
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
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
                      onFocus={(e) => {
                        e.target.style.borderColor = '#a855f7';
                        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
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
            <BarChart3 size={20} style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>Project Status</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Status</label>
                <div style={styles.badgeContainer}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(project.status)
                    }}
                  >
                    {getStatusIcon(project.status)}
                    <span style={{ marginLeft: '6px' }}>
                      {project.status || 'Active'}
                    </span>
                  </span>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Difficulty Level</label>
                <div style={styles.badgeContainer}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getDifficultyColor(project.difficulty_level)
                    }}
                  >
                    {getDifficultyIcon(project.difficulty_level)}
                    <span style={{ marginLeft: '6px' }}>
                      {project.difficulty_level || 'Medium'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Created</label>
                <div style={styles.fieldValue}>
                  <Calendar size={16} style={{ marginRight: '8px', color: '#9ca3af' }} />
                  {formatDate(project.created_at)}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Last Updated</label>
                <div style={styles.fieldValue}>
                  <Clock size={16} style={{ marginRight: '8px', color: '#9ca3af' }} />
                  {formatDate(project.updated_at)}
                </div>
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
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <div style={styles.fieldValue}>
                    <Target size={16} style={{ marginRight: '8px', color: '#9ca3af' }} />
                    {formatDate(project.deadline)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Repository Information */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <GitBranch size={20} style={styles.sectionIcon} />
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
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a855f7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ) : (
                project.github_repo_url ? (
                  <a
                    href={project.github_repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.linkButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#a855f7';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#a855f7';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <GitBranch size={16} style={{ marginRight: '8px' }} />
                    View on GitHub
                    <ExternalLink size={14} style={{ marginLeft: '8px' }} />
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
            <TrendingUp size={20} style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>Project Overview</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <User size={24} style={{ color: '#a855f7' }} />
                </div>
                <div style={styles.metaNumber}>1</div>
                <div style={styles.metaLabel}>Solo Developer</div>
              </div>
              
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <Calendar size={24} style={{ color: '#3b82f6' }} />
                </div>
                <div style={styles.metaNumber}>
                  {project.estimated_duration_weeks || '—'}
                </div>
                <div style={styles.metaLabel}>Estimated Weeks</div>
              </div>
              
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <BarChart3 size={24} style={{ color: '#10b981' }} />
                </div>
                <div style={styles.metaNumber}>
                  {Math.floor(Math.random() * 50) + 25}%
                </div>
                <div style={styles.metaLabel}>Progress</div>
              </div>
              
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <Clock size={24} style={{ color: '#f59e0b' }} />
                </div>
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
              <Code size={20} style={styles.sectionIcon} />
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

        {/* Documentation Section (if needed) */}
        <div style={styles.infoSection}>
          <div style={styles.sectionHeader}>
            <FileText size={20} style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>Project Notes</h3>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.notesList}>
              <div style={styles.noteItem}>
                <div style={styles.noteIcon}>
                  <Target size={16} style={{ color: '#a855f7' }} />
                </div>
                <div style={styles.noteContent}>
                  <div style={styles.noteTitle}>Goals & Objectives</div>
                  <div style={styles.noteText}>Track your project milestones and achievements</div>
                </div>
              </div>
              <div style={styles.noteItem}>
                <div style={styles.noteIcon}>
                  <Code size={16} style={{ color: '#3b82f6' }} />
                </div>
                <div style={styles.noteContent}>
                  <div style={styles.noteTitle}>Development Progress</div>
                  <div style={styles.noteText}>Monitor coding tasks and technical implementation</div>
                </div>
              </div>
              <div style={styles.noteItem}>
                <div style={styles.noteIcon}>
                  <BarChart3 size={16} style={{ color: '#10b981' }} />
                </div>
                <div style={styles.noteContent}>
                  <div style={styles.noteTitle}>Performance Metrics</div>
                  <div style={styles.noteText}>Analyze project efficiency and time management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPLETE STYLES ALIGNED WITH DASHBOARD & GOALS THEME
const styles = {
  container: {
    minHeight: 'calc(100vh - 40px)',
    backgroundColor: '#0F1116',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    paddingLeft: '270px', // Match dashboard sidebar spacing
    marginLeft: '-150px'   // Match dashboard sidebar spacing
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '0 0 20px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: '16px',
    margin: '8px 0 0 0'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  errorMessage: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
    backdropFilter: 'blur(8px)'
  },
  loadingState: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '18px',
    color: '#9ca3af'
  },
  infoGrid: {
    position: 'relative',
    zIndex: 10,
    display: 'grid',
    gap: '24px'
  },
  infoSection: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  sectionHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  sectionIcon: {
    color: '#a855f7'
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
    color: 'white',
    marginBottom: '8px',
    display: 'block'
  },
  fieldValue: {
    fontSize: '16px',
    color: '#d1d5db',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'center'
  },
  fieldInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: 'white'
  },
  fieldTextarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: 'white'
  },
  badgeContainer: {
    marginTop: '4px'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize'
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#a855f7',
    textDecoration: 'none',
    padding: '12px 20px',
    border: '2px solid #a855f7',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  metaItem: {
    textAlign: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  metaIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  metaNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 8px 0'
  },
  metaLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0
  },
  progressSection: {
    marginTop: '20px'
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '8px'
  },
  technologiesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  technologyTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500'
  },
  descriptionText: {
    fontSize: '16px',
    color: '#d1d5db',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  noteItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  noteIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  noteContent: {
    flex: 1
  },
  noteTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px'
  },
  noteText: {
    fontSize: '14px',
    color: '#9ca3af',
    lineHeight: '1.4'
  }
};

export default SoloProjectInfo;