// frontend/src/pages/Dashboard.js - UPDATED WITH REAL NOTIFICATIONS
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext'; // ADD THIS
import CreateProject from './CreateProject';
import SkillMatchingAPI from '../services/skillMatchingAPI';
import { projectService } from '../services/projectService';
import NotificationDropdown from '../components/Notifications/NotificationDropdown'; // ADD THIS
import NotificationDebug from '../components/Debug/NotificationDebug';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Real notifications from context
  const { 
    unreadCount, 
    notifications, 
    fetchNotifications 
  } = useNotifications();

  // New state for project statistics
  const [projectStats, setProjectStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    friends: 0,
    learningModules: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch project statistics
  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingStats(true);
        const response = await projectService.getUserProjects();
        const projects = response.data.projects || [];
        
        // Calculate statistics
        const stats = {
          activeProjects: projects.filter(p => 
            p.status === 'active' || p.status === 'recruiting'
          ).length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          friends: 0, // TODO: Implement friends functionality
          learningModules: 0 // TODO: Implement learning modules
        };
        
        setProjectStats(stats);
      } catch (error) {
        console.error('Error fetching project stats:', error);
        // Keep default stats (all 0) on error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProjectStats();
  }, [user?.id]);

  // Fetch recommended projects when component mounts
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingRecommendations(true);
        const recommendations = await SkillMatchingAPI.getRecommendations(user.id);
        setRecommendedProjects(recommendations.slice(0, 6)); // Show top 6 recommendations
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendedProjects([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [user?.id]);

  const handleCreateClick = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreate = () => {
    setShowCreateProject(false);
  };

  // UPDATED: Enhanced notification click handler with console logging
  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔔 Dashboard: Notification bell clicked!');
    console.log('🔔 Dashboard: Current showNotifications:', showNotifications);
    console.log('🔔 Dashboard: Unread count:', unreadCount);
    console.log('🔔 Dashboard: Notifications length:', notifications.length);
    
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    console.log('🔔 Dashboard: Setting showNotifications to:', newState);
    
    // Fetch notifications when opening dropdown if empty
    if (newState && notifications.length === 0) {
      console.log('🔔 Dashboard: Fetching notifications...');
      fetchNotifications();
    }
  };

  const handleProjectClick = async (project) => {
    try {
      // Update recommendation feedback
      await SkillMatchingAPI.updateRecommendationFeedback(
        project.recommendationId, 
        'viewed'
      );
      
      // Navigate to project details or join page
      navigate(`/projects/${project.projectId}`);
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      // Still navigate even if feedback update fails
      navigate(`/projects/${project.projectId}`);
    }
  };

  const handleJoinProject = async (project, event) => {
  event.stopPropagation(); // Prevent triggering the card click

  try {
    console.log('🚀 Navigating to project challenge:', project);
    
    // Update recommendation feedback for analytics
    try {
      await SkillMatchingAPI.updateRecommendationFeedback(
        project.recommendationId, 
        'applied'
      );
      console.log('✅ Updated recommendation feedback');
    } catch (feedbackError) {
      console.warn('⚠️ Failed to update recommendation feedback:', feedbackError);
      // Continue with navigation even if feedback fails
    }
    
    // Navigate directly to the challenge/join page
    // This will show the coding challenge interface
    console.log('🎯 Navigating to:', `/projects/${project.projectId}/join`);
    navigate(`/projects/${project.projectId}/join`);
    
  } catch (error) {
    console.error('❌ Error in join project handler:', error);
    // Still try to navigate even if there's an error
    navigate(`/projects/${project.projectId}/join`);
  }
};

  // UPDATED: Enhanced click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the notification area
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        console.log('🔔 Dashboard: Clicking outside, closing notifications');
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

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
      borderBottom: '1px solid #ddd'
    },
    title: {
      color: '#333',
      margin: 0,
      fontSize: '28px'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    createButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    iconButton: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'all 0.2s ease'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: '18px',
      height: '18px',
      backgroundColor: '#dc3545',
      color: 'white',
      borderRadius: '50%',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    notificationDropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '5px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      minWidth: '300px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000
    },
    notificationHeader: {
      padding: '15px',
      borderBottom: '1px solid #f8f9fa',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    notificationItem: {
      padding: '12px 15px',
      borderBottom: '1px solid #f8f9fa',
      fontSize: '13px'
    },
    notificationEmpty: {
      padding: '20px',
      textAlign: 'center',
      color: '#6c757d',
      fontSize: '14px'
    },
    welcomeCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '5px'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px'
    },
    profileSection: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    },
    sectionTitle: {
      color: '#333',
      marginBottom: '15px',
      fontSize: '18px'
    },
    recommendationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px',
      marginTop: '15px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    projectCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #007bff'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    projectDescription: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '12px',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    matchScore: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      backgroundColor: '#28a745',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    projectMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    difficultyBadge: {
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    memberCount: {
      color: '#666',
      fontSize: '12px'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginBottom: '12px'
    },
    tag: {
      backgroundColor: '#e9ecef',
      color: '#495057',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '11px'
    },
    joinButton: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: '#666'
    },
    emptyState: {
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
      padding: '40px 20px'
    },
    userInfoContainer: {
      marginTop: '20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    userInfoSection: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '16px'
    },
    userInfoTitle: {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333'
    },
    userInfoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '12px'
    },
    userInfoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    userInfoLabel: {
      fontSize: '12px',
      color: '#666',
      fontWeight: '500'
    },
    userInfoValue: {
      fontSize: '14px',
      color: '#333',
      fontWeight: '400'
    },
    bioSection: {
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid #f1f3f4'
    },
    bioText: {
      margin: '4px 0 0 0',
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.4'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    languageTag: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      gap: '4px'
    },
    topicTag: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#28a745',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      gap: '4px'
    },
    skillLevel: {
      fontSize: '10px',
      opacity: 0.8,
      fontWeight: '400'
    },
    emptySkills: {
      color: '#666',
      fontSize: '13px',
      fontStyle: 'italic',
      margin: 0
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }
  };

  // Helper function to get difficulty badge style
  const getDifficultyStyle = (difficulty) => {
    const baseStyle = styles.difficultyBadge;
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'hard':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'expert':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
      default:
        return { ...baseStyle, backgroundColor: '#e9ecef', color: '#495057' };
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome back, {user?.full_name || user?.username}!</h1>
        <div style={styles.headerActions}>
          <button style={styles.createButton} onClick={handleCreateClick}>
            <span>➕</span>
            Create Project
          </button>
          
          <div style={{ position: 'relative' }}>
            <button 
              style={{
                ...styles.iconButton,
                color: unreadCount > 0 ? '#3498db' : '#6c757d' // Change color when has notifications
              }} 
              onClick={handleNotificationClick}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* UPDATED: Use real NotificationDropdown component */}
            {showNotifications && (
              <div 
                className="notification-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '5px',
                  zIndex: 1000
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div style={styles.modal} onClick={handleCloseCreate}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <CreateProject onClose={handleCloseCreate} />
          </div>
        </div>
      )}

      <div style={styles.welcomeCard}>
        <h2>🎉 Dashboard Overview</h2>
        <p>
          Great to see you back! Here's your personalized dashboard where you can track your projects,
          connect with fellow developers, and continue learning. FIX TASK VIEW
        </p>

        {/* User Profile Information */}
        <div style={styles.userInfoContainer}>
          <div style={styles.userInfoSection}>
            <h4 style={styles.userInfoTitle}>👤 Profile Info</h4>
            <div style={styles.userInfoGrid}>
              <div style={styles.userInfoItem}>
                <span style={styles.userInfoLabel}>Experience:</span>
                <span style={styles.userInfoValue}>{user?.years_experience || 0} years</span>
              </div>
              <div style={styles.userInfoItem}>
                <span style={styles.userInfoLabel}>Username:</span>
                <span style={styles.userInfoValue}>@{user?.username}</span>
              </div>
              <div style={styles.userInfoItem}>
                <span style={styles.userInfoLabel}>Email:</span>
                <span style={styles.userInfoValue}>{user?.email}</span>
              </div>
              {user?.github_username && (
                <div style={styles.userInfoItem}>
                  <span style={styles.userInfoLabel}>GitHub:</span>
                  <span style={styles.userInfoValue}>@{user.github_username}</span>
                </div>
              )}
            </div>
            
            {user?.bio && (
              <div style={styles.bioSection}>
                <span style={styles.userInfoLabel}>Bio:</span>
                <p style={styles.bioText}>{user.bio}</p>
              </div>
            )}
          </div>

          <div style={styles.userInfoSection}>
            <h4 style={styles.userInfoTitle}>💻 Programming Languages</h4>
            {user?.programming_languages && user.programming_languages.length > 0 ? (
              <div style={styles.skillsContainer}>
                {user.programming_languages.map(lang => (
                  <span key={lang.id} style={styles.languageTag}>
                    {lang.programming_languages?.name || lang.name}
                    <span style={styles.skillLevel}>({lang.proficiency_level})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.emptySkills}>No programming languages added yet</p>
            )}
          </div>

          <div style={styles.userInfoSection}>
            <h4 style={styles.userInfoTitle}>🎯 Areas of Interest</h4>
            {user?.topics && user.topics.length > 0 ? (
              <div style={styles.skillsContainer}>
                {user.topics.map(topic => (
                  <span key={topic.id} style={styles.topicTag}>
                    {topic.topics?.name || topic.name}
                    <span style={styles.skillLevel}>({topic.interest_level})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.emptySkills}>No topics selected yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats - Updated with Real Data but keeping original styling */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {loadingStats ? '...' : projectStats.activeProjects}
          </div>
          <div style={styles.statLabel}>Active Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {loadingStats ? '...' : projectStats.completedProjects}
          </div>
          <div style={styles.statLabel}>Completed Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {loadingStats ? '...' : projectStats.friends}
          </div>
          <div style={styles.statLabel}>Friends</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {loadingStats ? '...' : projectStats.learningModules}
          </div>
          <div style={styles.statLabel}>Learning Modules</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>🎯 Recent Activity</h3>
        <div style={styles.emptyState}>
          No recent activity yet. Start by joining a project or connecting with other developers!
        </div>
      </div>

      {/* Recommended Projects Section */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>🚀 Recommended Projects</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Based on your skills in {user?.programming_languages?.slice(0, 2).map(l => l.programming_languages?.name || l.name).join(', ')} and your interest in {user?.topics?.slice(0, 2).map(t => t.topics?.name || t.name).join(', ')}, we'll recommend relevant projects here.
        </p>
        
        {loadingRecommendations ? (
          <div style={styles.loadingSpinner}>
            <div>Loading recommendations...</div>
          </div>
        ) : recommendedProjects.length > 0 ? (
          <div style={styles.recommendationsGrid}>
            {recommendedProjects.map((project, index) => (
              <div
                key={index}
                style={styles.projectCard}
                onClick={() => handleProjectClick(project)}
                onMouseEnter={(e) => {
                  Object.assign(e.target.style, styles.projectCardHover);
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = 'none';
                  e.target.style.border = '1px solid #dee2e6';
                }}
              >
                <div style={styles.matchScore}>
                  {Math.round(project.score)}% match
                </div>
                
                <div style={styles.projectTitle}>
                  {project.title}
                </div>
                
                <div style={styles.projectDescription}>
                  {project.description}
                </div>
                
                <div style={styles.projectMeta}>
                  <span style={getDifficultyStyle(project.difficulty_level)}>
                    {project.difficulty_level?.toUpperCase() || 'MEDIUM'}
                  </span>
                  <span style={styles.memberCount}>
                    {project.current_members || 0}/{project.maximum_members || 10} members
                  </span>
                </div>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div style={styles.tagsContainer}>
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <span key={techIndex} style={styles.tag}>
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span style={styles.tag}>
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <button
                  style={styles.joinButton}
                  onClick={(e) => handleJoinProject(project, e)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#007bff';
                  }}
                >
                  Join Project
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            No project recommendations available yet. Complete more of your profile to get personalized recommendations!
          </div>
        )}
      </div>

      {/* Continue Learning Section */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>📚 Continue Learning</h3>
        <p style={{ color: '#666' }}>
          Enhance your skills with personalized learning paths and tutorials.
        </p>
        <div style={{ marginTop: '15px' }}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}>
            Start Learning
          </button>
        </div>
      </div>
      
      <NotificationDebug />
    </div>
  );
}

export default Dashboard;