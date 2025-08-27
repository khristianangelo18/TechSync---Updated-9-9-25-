// frontend/src/pages/soloproject/SoloProjectDashboard.js - UPDATED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SoloProjectService from '../../services/soloProjectService'; // NEW import
import { taskService } from '../../services/taskService'; // Keep existing task service

function SoloProjectDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [project, setProject] = useState(null);
  const [projectStats, setProjectStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    timeSpentToday: 0,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState('');

  // Fetch dashboard data using NEW backend API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Fetching dashboard data for solo project:', projectId);

      // Use the new SoloProjectService for dashboard data
      const response = await SoloProjectService.getDashboardData(projectId);
      
      if (response.success) {
        const { project: projectData, stats } = response.data;
        setProject(projectData);
        setProjectStats(stats);
        console.log('✅ Dashboard data fetched successfully:', stats);
      }

      // Still fetch tasks using existing task service for consistency
      try {
        const tasksResponse = await taskService.getProjectTasks(projectId);
        if (tasksResponse.success) {
          setTasks(tasksResponse.data.tasks || []);
        }
      } catch (taskError) {
        console.warn('Could not fetch tasks:', taskError);
        // This is okay, dashboard will still work without task details
      }

    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch recent activity using NEW backend API
  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      
      console.log('🔄 Fetching recent activity for solo project:', projectId);

      // Use the new SoloProjectService for recent activity
      const response = await SoloProjectService.getRecentActivity(projectId, 10);
      
      if (response.success) {
        setRecentActivity(response.data.activities || []);
        console.log('✅ Recent activity fetched successfully');
      }
    } catch (error) {
      console.warn('Could not fetch recent activity:', error);
      // Fallback to mock data if API fails (for development)
      const mockActivity = [
        {
          id: 1,
          activity_type: 'task_completed',
          activity_data: {
            action: 'completed task',
            target: 'Implement user authentication'
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: 2,
          activity_type: 'task_started',
          activity_data: {
            action: 'started working on',
            target: 'Database schema design'
          },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        }
      ];
      setRecentActivity(mockActivity);
    } finally {
      setLoadingActivity(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, [fetchDashboardData, fetchRecentActivity]);

  // Helper function to log activity
  const logActivity = useCallback(async (action, target, type) => {
    try {
      await SoloProjectService.logActivity(projectId, {
        action,
        target,
        type
      });
      // Refresh activity after logging
      fetchRecentActivity();
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [projectId, fetchRecentActivity]);

  // Quick actions
  const handleQuickTaskCreate = async () => {
    try {
      navigate(`/project/${projectId}/tasks`);
      // Log activity
      await logActivity('navigated to', 'Tasks page', 'project_updated');
    } catch (error) {
      console.error('Failed to navigate to tasks:', error);
    }
  };

  const handleQuickGoalCreate = async () => {
    try {
      navigate(`/soloproject/${projectId}/goals`);
      // Log activity
      await logActivity('navigated to', 'Goals page', 'project_updated');
    } catch (error) {
      console.error('Failed to navigate to goals:', error);
    }
  };

  const handleQuickNoteCreate = async () => {
    try {
      navigate(`/soloproject/${projectId}/notes`);
      // Log activity
      await logActivity('navigated to', 'Notes page', 'project_updated');
    } catch (error) {
      console.error('Failed to navigate to notes:', error);
    }
  };

  // Render loading state
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
        
        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${projectStats.completionRate}%`
              }}
            />
          </div>
          <p style={styles.progressText}>
            {projectStats.completionRate}% Complete • {projectStats.completedTasks} of {projectStats.totalTasks} tasks done
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {/* Task Statistics */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{projectStats.totalTasks}</h3>
            <p style={styles.statLabel}>Total Tasks</p>
            <p style={styles.statSubtext}>
              {projectStats.inProgressTasks} in progress
            </p>
          </div>
        </div>

        {/* Goal Statistics */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{projectStats.totalGoals}</h3>
            <p style={styles.statLabel}>Goals Set</p>
            <p style={styles.statSubtext}>
              {projectStats.activeGoals} active goals
            </p>
          </div>
        </div>

        {/* Time Today */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{projectStats.timeSpentToday}h</h3>
            <p style={styles.statLabel}>Time Today</p>
            <p style={styles.statSubtext}>
              {projectStats.streakDays} day streak
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{projectStats.completionRate}%</h3>
            <p style={styles.statLabel}>Completion Rate</p>
            <p style={styles.statSubtext}>
              {projectStats.completedTasks} completed
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsSection}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.quickActions}>
          <button 
            style={styles.quickActionButton}
            onClick={handleQuickTaskCreate}
          >
            <span style={styles.quickActionIcon}>➕</span>
            <span>Create Task</span>
          </button>
          <button 
            style={styles.quickActionButton}
            onClick={handleQuickGoalCreate}
          >
            <span style={styles.quickActionIcon}>🎯</span>
            <span>Set Goal</span>
          </button>
          <button 
            style={styles.quickActionButton}
            onClick={handleQuickNoteCreate}
          >
            <span style={styles.quickActionIcon}>📝</span>
            <span>Take Note</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Recent Tasks */}
        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Tasks</h3>
            <button 
              style={styles.viewAllButton}
              onClick={() => navigate(`/project/${projectId}/tasks`)}
            >
              View All →
            </button>
          </div>
          <div style={styles.cardContent}>
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={styles.taskInfo}>
                    <span 
                      style={{
                        ...styles.taskStatus,
                        backgroundColor: SoloProjectService.getStatusColor(task.status)
                      }}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <h4 style={styles.taskTitle}>{task.title}</h4>
                    <p style={styles.taskMeta}>
                      {task.priority} priority
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📝</div>
                <p style={styles.emptyStateText}>No tasks yet. Create your first task!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Activity</h3>
            <span style={styles.activityCount}>
              {loadingActivity ? 'Loading...' : `${recentActivity.length} activities`}
            </span>
          </div>
          <div style={styles.cardContent}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} style={styles.activityItem}>
                  <div style={styles.activityIcon}>
                    {SoloProjectService.getActivityTypeIcon(activity.activity_type)}
                  </div>
                  <div style={styles.activityInfo}>
                    <p style={styles.activityText}>
                      <span style={styles.activityAction}>
                        {activity.activity_data?.action || 'performed action'}
                      </span>
                      <span style={styles.activityTarget}>
                        {activity.activity_data?.target || 'unknown target'}
                      </span>
                    </p>
                    <p style={styles.activityTime}>
                      {SoloProjectService.formatTimeAgo(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📊</div>
                <p style={styles.emptyStateText}>
                  {loadingActivity ? 'Loading activities...' : 'No recent activity'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles remain the same as original
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6c757d',
    margin: 0
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    marginBottom: '32px'
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0'
  },
  welcomeMessage: {
    fontSize: '16px',
    color: '#6c757d',
    margin: '0 0 24px 0'
  },
  progressContainer: {
    marginTop: '20px'
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
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statIcon: {
    fontSize: '40px'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px 0'
  },
  statLabel: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    margin: '0 0 4px 0'
  },
  statSubtext: {
    fontSize: '14px',
    color: '#6c757d',
    margin: 0
  },
  quickActionsSection: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0'
  },
  quickActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  quickActionIcon: {
    fontSize: '16px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  viewAllButton: {
    background: 'none',
    border: 'none',
    color: '#6f42c1',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  activityCount: {
    fontSize: '14px',
    color: '#6c757d'
  },
  cardContent: {
    padding: '24px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  taskItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f1f3f4'
  },
  taskInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  taskStatus: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize',
    width: 'fit-content'
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    margin: 0
  },
  taskMeta: {
    fontSize: '12px',
    color: '#6c757d',
    margin: 0,
    textTransform: 'capitalize'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f1f3f4'
  },
  activityIcon: {
    fontSize: '20px',
    marginTop: '2px'
  },
  activityInfo: {
    flex: 1
  },
  activityText: {
    fontSize: '14px',
    color: '#333',
    margin: '0 0 4px 0',
    lineHeight: '1.4'
  },
  activityAction: {
    fontWeight: '500'
  },
  activityTarget: {
    fontWeight: '400',
    marginLeft: '4px'
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
  }
};

export default SoloProjectDashboard;