// frontend/src/pages/soloproject/SoloProjectDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';

function SoloProjectDashboard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectStats, setProjectStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    timeSpentToday: 0,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Fetch project and dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project details
      const projectResponse = await projectService.getProjectById(projectId);
      if (projectResponse.success) {
        setProject(projectResponse.data.project);
      }

      // Fetch project tasks
      const tasksResponse = await projectService.getProjectTasks(projectId);
      if (tasksResponse.success) {
        setTasks(tasksResponse.data.tasks || []);
        
        // Calculate project statistics
        const allTasks = tasksResponse.data.tasks || [];
        const completed = allTasks.filter(task => task.status === 'completed');
        const inProgress = allTasks.filter(task => task.status === 'in_progress');
        const completionRate = allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0;
        
        setProjectStats({
          totalTasks: allTasks.length,
          completedTasks: completed.length,
          inProgressTasks: inProgress.length,
          completionRate: completionRate,
          timeSpentToday: Math.floor(Math.random() * 8) + 1, // Mock data - replace with actual tracking
          streakDays: Math.floor(Math.random() * 30) + 1 // Mock data - replace with actual tracking
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch recent activity (mock data for now)
  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      
      // Mock recent activity - replace with actual API call
      const mockActivity = [
        {
          id: 1,
          action: 'completed task',
          target: 'Implement user authentication',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          type: 'task_completed'
        },
        {
          id: 2,
          action: 'started working on',
          target: 'Database schema design',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          type: 'task_started'
        },
        {
          id: 3,
          action: 'updated project',
          target: 'Added new requirements',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          type: 'project_updated'
        },
        {
          id: 4,
          action: 'uploaded file',
          target: 'project-wireframes.pdf',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          type: 'file_uploaded'
        }
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, [fetchDashboardData, fetchRecentActivity]);

  // Helper functions
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'task_started': return '🚀';
      case 'project_updated': return '📝';
      case 'file_uploaded': return '📁';
      default: return '📌';
    }
  };

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
      margin: '0 0 8px 0',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    welcomeSection: {
      backgroundColor: '#6f42c1',
      color: 'white',
      padding: '24px',
      borderRadius: '12px',
      marginBottom: '30px',
      backgroundImage: 'linear-gradient(135deg, #6f42c1 0%, #9c27b0 100%)'
    },
    welcomeTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    welcomeMessage: {
      fontSize: '16px',
      margin: 0,
      opacity: 0.9
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      textAlign: 'center',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#6f42c1',
      margin: '0 0 8px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6c757d',
      margin: 0,
      fontWeight: '500'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '30px',
      marginBottom: '30px'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      overflow: 'hidden'
    },
    sectionHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    sectionContent: {
      padding: '24px'
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f1f3f4'
    },
    taskItemLast: {
      borderBottom: 'none'
    },
    taskStatus: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      marginRight: '12px',
      flexShrink: 0
    },
    taskStatusCompleted: {
      backgroundColor: '#28a745'
    },
    taskStatusInProgress: {
      backgroundColor: '#ffc107'
    },
    taskStatusTodo: {
      backgroundColor: '#6c757d'
    },
    taskInfo: {
      flex: 1,
      minWidth: 0
    },
    taskTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      margin: '0 0 4px 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    taskMeta: {
      fontSize: '12px',
      color: '#6c757d',
      margin: 0
    },
    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 0',
      borderBottom: '1px solid #f1f3f4'
    },
    activityItemLast: {
      borderBottom: 'none'
    },
    activityIcon: {
      fontSize: '16px',
      marginRight: '12px',
      marginTop: '2px',
      flexShrink: 0
    },
    activityContent: {
      flex: 1,
      minWidth: 0
    },
    activityText: {
      fontSize: '14px',
      color: '#333',
      margin: '0 0 4px 0',
      lineHeight: '1.4'
    },
    activityTime: {
      fontSize: '12px',
      color: '#6c757d',
      margin: 0
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6c757d'
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5
    },
    emptyStateText: {
      fontSize: '16px',
      margin: 0
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6c757d'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      color: '#721c24',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden',
      margin: '16px 0'
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
      margin: '8px 0 0 0'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Get recent tasks for display
  const recentTasks = tasks.slice(0, 5);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome to your solo project workspace
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h2 style={styles.welcomeTitle}>
          Welcome back, {user?.full_name || user?.username || 'Developer'}! 👋
        </h2>
        <p style={styles.welcomeMessage}>
          {project?.title || 'Your Solo Project'} • Keep up the great work!
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.statCardHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{projectStats.totalTasks}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.statCardHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{projectStats.completedTasks}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.statCardHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{projectStats.completionRate}%</div>
          <div style={styles.statLabel}>Progress</div>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.statCardHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{projectStats.timeSpentToday}h</div>
          <div style={styles.statLabel}>Today</div>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.statCardHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{projectStats.streakDays}</div>
          <div style={styles.statLabel}>Day Streak</div>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.statCardHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{projectStats.inProgressTasks}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Project Progress</h3>
        </div>
        <div style={styles.sectionContent}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${projectStats.completionRate}%`
              }}
            />
          </div>
          <p style={styles.progressText}>
            {projectStats.completedTasks} of {projectStats.totalTasks} tasks completed ({projectStats.completionRate}%)
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        {/* Recent Tasks */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Tasks</h3>
          </div>
          <div style={styles.sectionContent}>
            {recentTasks.length > 0 ? (
              recentTasks.map((task, index) => {
                const isLast = index === recentTasks.length - 1;
                const getStatusStyle = (status) => {
                  switch (status) {
                    case 'completed':
                      return styles.taskStatusCompleted;
                    case 'in_progress':
                      return styles.taskStatusInProgress;
                    default:
                      return styles.taskStatusTodo;
                  }
                };

                return (
                  <div
                    key={task.id}
                    style={{
                      ...styles.taskItem,
                      ...(isLast ? styles.taskItemLast : {})
                    }}
                  >
                    <div style={{
                      ...styles.taskStatus,
                      ...getStatusStyle(task.status)
                    }} />
                    <div style={styles.taskInfo}>
                      <div style={styles.taskTitle}>{task.title}</div>
                      <div style={styles.taskMeta}>
                        {task.status === 'completed' ? 'Completed' : 
                         task.status === 'in_progress' ? 'In Progress' : 'To Do'} • 
                        Priority: {task.priority || 'Medium'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📝</div>
                <div style={styles.emptyStateText}>No tasks yet. Create your first task to get started!</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Activity</h3>
          </div>
          <div style={styles.sectionContent}>
            {loadingActivity ? (
              <div style={styles.loadingState}>Loading activity...</div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const isLast = index === recentActivity.length - 1;
                return (
                  <div
                    key={activity.id}
                    style={{
                      ...styles.activityItem,
                      ...(isLast ? styles.activityItemLast : {})
                    }}
                  >
                    <div style={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityText}>
                        <strong>You</strong> {activity.action} {activity.target}
                      </div>
                      <div style={styles.activityTime}>
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📊</div>
                <div style={styles.emptyStateText}>No recent activity</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoloProjectDashboard;