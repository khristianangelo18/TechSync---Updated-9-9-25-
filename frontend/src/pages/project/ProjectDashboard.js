// frontend/src/pages/project/ProjectDashboard.js - ENHANCED VERSION WITH ALIGNED THEME
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';

// Background symbols component - ALIGNED WITH DASHBOARD
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
      default: return '📄';
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
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px', // Match Dashboard.js sidebar spacing
      marginLeft: '-150px'   // Match Dashboard.js sidebar spacing
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
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
    
    // Analytics Cards at Top
    analyticsGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    analyticsCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '25px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    },
    analyticsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    analyticsTitle: {
      color: 'white',
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
      color: '#3b82f6',
      margin: '10px 0'
    },
    analyticsSubtext: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '10px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981, #059669)',
      transition: 'width 0.3s ease'
    },

    // Main Content Grid
    contentGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px',
      marginBottom: '30px'
    },
    
    // Announcements Section
    announcementsSection: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px'
    },
    card: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '25px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    cardTitle: {
      color: 'white',
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
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      marginBottom: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      transition: 'all 0.2s ease'
    },
    taskInfo: {
      flex: 1
    },
    taskTitle: {
      color: 'white',
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
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
      color: '#fbbf24',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      display: 'flex',
      alignItems: 'center'
    },
    
    // Activity Feed
    activityItem: {
      display: 'flex',
      gap: '12px',
      padding: '15px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    activityIcon: {
      fontSize: '20px',
      marginTop: '2px'
    },
    activityContent: {
      flex: 1
    },
    activityText: {
      color: 'white',
      fontSize: '14px',
      marginBottom: '4px'
    },
    activityTime: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    activityTarget: {
      fontWeight: '500',
      color: '#3b82f6'
    },
    
    // Other elements
    stat: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    },
    statLabel: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    statValue: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    },
    description: {
      color: '#d1d5db',
      lineHeight: '1.6',
      fontSize: '14px'
    },
    tag: {
      display: 'inline-block',
      padding: '6px 12px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
      color: '#93c5fd',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '8px',
      marginBottom: '8px',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '18px',
      color: '#9ca3af'
    },
    emptyState: {
      textAlign: 'center',
      color: '#9ca3af',
      padding: '40px 20px',
      fontStyle: 'italic',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.loading}>Loading project dashboard...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.loading}>Project not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Code Symbols - Now consistent with Dashboard */}
      <BackgroundSymbols />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{project.title}</h1>
          <p style={styles.subtitle}>Project Dashboard & Analytics</p>
        </div>
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
            color: analytics.overdueTasksCount > 0 ? '#ef4444' : '#10b981'
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