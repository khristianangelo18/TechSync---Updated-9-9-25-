// frontend/src/pages/project/ProjectDashboard.js - ENHANCED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';

function ProjectDashboard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    overdueTasksCount: 0,
    completionRate: 0
  });
  const [dueTasks, setDueTasks] = useState([]);
  const [memberActivity, setMemberActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectResponse = await projectService.getProjectById(projectId);
      const projectData = projectResponse.data.project;
      setProject(projectData);

      // Fetch project members
      try {
        const membersResponse = await projectService.getProjectMembers(projectId);
        setMembers([membersResponse.data.owner, ...membersResponse.data.members]);
      } catch (error) {
        console.log('Could not fetch members:', error);
        setMembers([]);
      }

      // Fetch project tasks for analytics
      try {
        const tasksResponse = await taskService.getProjectTasks(projectId);
        const tasks = tasksResponse.data.tasks || [];
        
        // Calculate analytics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const activeTasks = tasks.filter(t => ['todo', 'in_progress', 'in_review'].includes(t.status)).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Find overdue and due soon tasks
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const dueSoonTasks = tasks.filter(task => {
          if (!task.due_date || task.status === 'completed') return false;
          const dueDate = new Date(task.due_date);
          return dueDate <= nextWeek && dueDate >= now;
        }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

        const overdueTasksCount = tasks.filter(task => {
          if (!task.due_date || task.status === 'completed') return false;
          return new Date(task.due_date) < now;
        }).length;

        setAnalytics({
          totalTasks,
          completedTasks,
          activeTasks,
          overdueTasksCount,
          completionRate
        });
        
        setDueTasks(dueSoonTasks.slice(0, 5)); // Show max 5 upcoming tasks
      } catch (error) {
        console.log('Could not fetch tasks:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Mock member activity (in real app, this would come from activity logs)
  const fetchMemberActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      
      // Simulate recent activity data
      // In a real app, you'd have an activity/audit log table
      const mockActivity = [
        {
          id: 1,
          user: members.find(m => m.id === user?.id) || { full_name: 'You', username: 'you' },
          action: 'completed task',
          target: 'Setup project structure',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          type: 'task_completed'
        },
        {
          id: 2,
          user: members[1] || { full_name: 'Team Member', username: 'member' },
          action: 'created task',
          target: 'Implement authentication',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          type: 'task_created'
        },
        {
          id: 3,
          user: members[0] || { full_name: 'Project Owner', username: 'owner' },
          action: 'updated project',
          target: 'Project description',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          type: 'project_updated'
        },
        {
          id: 4,
          user: members[1] || { full_name: 'Team Member', username: 'member' },
          action: 'joined project',
          target: '',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          type: 'member_joined'
        }
      ].filter(activity => activity.user); // Only show activities for existing members

      setMemberActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching member activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  }, [members, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (members.length > 0) {
      fetchMemberActivity();
    }
  }, [fetchMemberActivity, members.length]);

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

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 1) return `Due in ${diffDays} days`;
    return 'Overdue';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'task_created': return '📝';
      case 'project_updated': return '📊';
      case 'member_joined': return '👋';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
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
    
    // Analytics Cards at Top
    analyticsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    analyticsCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    analyticsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    analyticsTitle: {
      color: '#333',
      fontSize: '16px',
      fontWeight: '600',
      margin: 0
    },
    analyticsIcon: {
      fontSize: '24px'
    },
    analyticsValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#007bff',
      margin: '10px 0'
    },
    analyticsSubtext: {
      color: '#6c757d',
      fontSize: '14px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '10px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#28a745',
      transition: 'width 0.3s ease'
    },

    // Main Content Grid
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px',
      marginBottom: '30px'
    },
    
    // Announcements Section
    announcementsSection: {
      marginBottom: '30px'
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '25px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      color: '#333',
      fontSize: '20px',
      marginBottom: '20px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    
    // Due Tasks
    taskItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 15px',
      border: '1px solid #eee',
      borderRadius: '6px',
      marginBottom: '10px',
      transition: 'background-color 0.2s ease'
    },
    taskInfo: {
      flex: 1
    },
    taskTitle: {
      color: '#333',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    taskMeta: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    priorityBadge: {
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500',
      color: 'white'
    },
    dueBadge: {
      padding: '4px 8px',
      backgroundColor: '#fff3cd',
      color: '#856404',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    
    // Activity Feed
    activityItem: {
      display: 'flex',
      gap: '12px',
      padding: '15px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    activityIcon: {
      fontSize: '20px',
      marginTop: '2px'
    },
    activityContent: {
      flex: 1
    },
    activityText: {
      color: '#333',
      fontSize: '14px',
      marginBottom: '4px'
    },
    activityTime: {
      color: '#6c757d',
      fontSize: '12px'
    },
    activityTarget: {
      fontWeight: '500',
      color: '#007bff'
    },
    
    // Other elements
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
    },
    emptyState: {
      textAlign: 'center',
      color: '#6c757d',
      padding: '20px',
      fontStyle: 'italic'
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
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{project.title}</h1>
        <p style={styles.subtitle}>Project Dashboard & Analytics</p>
      </div>

      {/* Analytics Cards */}
      <div style={styles.analyticsGrid}>
        {/* Project Completion */}
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsHeader}>
            <h3 style={styles.analyticsTitle}>Project Progress</h3>
            <span style={styles.analyticsIcon}>📈</span>
          </div>
          <div style={styles.analyticsValue}>{analytics.completionRate}%</div>
          <div style={styles.analyticsSubtext}>
            {analytics.completedTasks} of {analytics.totalTasks} tasks completed
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${analytics.completionRate}%`
              }}
            />
          </div>
        </div>

        {/* Active Tasks */}
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsHeader}>
            <h3 style={styles.analyticsTitle}>Active Tasks</h3>
            <span style={styles.analyticsIcon}>⚡</span>
          </div>
          <div style={styles.analyticsValue}>{analytics.activeTasks}</div>
          <div style={styles.analyticsSubtext}>
            Tasks in progress or pending review
          </div>
        </div>

        {/* Overdue Tasks */}
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsHeader}>
            <h3 style={styles.analyticsTitle}>Overdue Tasks</h3>
            <span style={styles.analyticsIcon}>⚠️</span>
          </div>
          <div style={{
            ...styles.analyticsValue,
            color: analytics.overdueTasksCount > 0 ? '#dc3545' : '#28a745'
          }}>
            {analytics.overdueTasksCount}
          </div>
          <div style={styles.analyticsSubtext}>
            {analytics.overdueTasksCount > 0 ? 'Need immediate attention' : 'All tasks on track'}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div style={styles.announcementsSection}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            📢 Announcements
          </h3>
          {dueTasks.length > 0 ? (
            <div>
              <p style={styles.description}>Tasks approaching their due dates:</p>
              {dueTasks.map((task) => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={styles.taskInfo}>
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskMeta}>
                      <span 
                        style={{
                          ...styles.priorityBadge,
                          backgroundColor: getPriorityColor(task.priority)
                        }}
                      >
                        {task.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span style={styles.dueBadge}>
                        {formatDueDate(task.due_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              No upcoming due dates. Great job staying on track! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Left Column */}
        <div>
          {/* Member Activity */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              🕐 Recent Activity
            </h3>
            {loadingActivity ? (
              <div style={styles.emptyState}>Loading activity...</div>
            ) : memberActivity.length > 0 ? (
              <div>
                {memberActivity.map((activity) => (
                  <div key={activity.id} style={styles.activityItem}>
                    <span style={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </span>
                    <div style={styles.activityContent}>
                      <div style={styles.activityText}>
                        <strong>{activity.user.full_name || activity.user.username}</strong> {activity.action}
                        {activity.target && (
                          <span style={styles.activityTarget}> "{activity.target}"</span>
                        )}
                      </div>
                      <div style={styles.activityTime}>
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                No recent activity. Get started by creating tasks or updating the project!
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
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
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;