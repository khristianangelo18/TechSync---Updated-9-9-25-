import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';

function ProjectDashboard() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getProjectById(projectId);
        setProject(response.data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      color: '#333',
      fontSize: '28px',
      margin: '0 0 10px 0'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      color: '#333',
      fontSize: '18px',
      marginBottom: '15px',
      fontWeight: 'bold'
    },
    stat: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    },
    statLabel: {
      color: '#6c757d',
      fontSize: '14px'
    },
    statValue: {
      color: '#333',
      fontSize: '14px',
      fontWeight: '500'
    },
    description: {
      color: '#666',
      lineHeight: '1.6',
      fontSize: '14px'
    },
    tag: {
      display: 'inline-block',
      padding: '4px 8px',
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
      marginRight: '8px',
      marginBottom: '8px'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '18px',
      color: '#6c757d'
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading project dashboard...</div>;
  }

  if (!project) {
    return <div style={styles.loading}>Project not found</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{project.title}</h1>
        <p style={styles.subtitle}>Project Dashboard & Overview</p>
      </div>

      <div style={styles.grid}>
        {/* Project Overview */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📊 Project Overview</h3>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Status:</span>
            <span style={styles.statValue}>{project.status?.toUpperCase()}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Difficulty:</span>
            <span style={styles.statValue}>{project.difficulty_level?.toUpperCase()}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Duration:</span>
            <span style={styles.statValue}>{project.estimated_duration_weeks} weeks</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Team Size:</span>
            <span style={styles.statValue}>
              {project.current_members || 0}/{project.maximum_members} members
            </span>
          </div>
        </div>

        {/* Project Description */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📝 Description</h3>
          <p style={styles.description}>{project.description}</p>
        </div>

        {/* Technologies */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💻 Technologies</h3>
          {project.project_languages && project.project_languages.length > 0 ? (
            project.project_languages.map((lang, index) => (
              <span key={index} style={styles.tag}>
                {lang.programming_languages?.name || lang.name}
              </span>
            ))
          ) : (
            <p style={styles.description}>No technologies specified</p>
          )}
        </div>

        {/* Recent Activity */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🕐 Recent Activity</h3>
          <p style={styles.description}>No recent activity yet. Get started by creating tasks or inviting team members!</p>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;