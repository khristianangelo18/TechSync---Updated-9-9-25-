// frontend/src/pages/Dashboard.js - SIMPLIFIED VERSION - Only Welcome & Recommendations
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import CreateProject from './CreateProject';
import SkillMatchingAPI from '../services/skillMatchingAPI';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';

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
      console.error('Error joining project:', error);
      // Show user feedback about the error if needed
    }
  };

  const getDifficultyStyle = (difficulty) => {
    const colors = {
      easy: '#28a745',
      medium: '#ffc107', 
      hard: '#dc3545'
    };
    
    return {
      backgroundColor: colors[difficulty?.toLowerCase()] || colors.medium,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold'
    };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid #e9ecef'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    createButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#0056b3'
      }
    },
    notificationContainer: {
      position: 'relative'
    },
    notificationButton: {
      backgroundColor: 'transparent',
      border: '2px solid #dee2e6',
      borderRadius: '6px',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '16px',
      position: 'relative',
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
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '0',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto'
    },
    welcomeCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '30px'
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
      fontSize: '18px',
      fontWeight: 'bold'
    },
    recommendationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
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
    matchScore: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px',
      paddingRight: '60px' // Make room for match score
    },
    projectDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.4',
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    projectMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      fontSize: '12px'
    },
    memberCount: {
      color: '#666',
      fontSize: '12px'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '15px'
    },
    tag: {
      backgroundColor: '#e9ecef',
      color: '#495057',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    joinButton: {
      width: '100%',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Dashboard</h1>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.createButton}
            onClick={handleCreateClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
            }}
          >
            + Create Project
          </button>
          
          {/* Notification Bell */}
          <div style={styles.notificationContainer}>
            <button 
              style={{
                ...styles.notificationButton,
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

      {/* Welcome Section */}
      <div style={styles.welcomeCard}>
        <h2>🎉 Welcome Back!</h2>
        <p>
          Great to see you back! Ready to start or continue working on your projects? 
          Check out our personalized recommendations below.
        </p>
      </div>

      {/* Recommended Projects Section */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>🚀 Recommended Projects</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Based on your skills in {user?.programming_languages?.slice(0, 2).map(l => l.programming_languages?.name || l.name).join(', ')} and your interest in {user?.topics?.slice(0, 2).map(t => t.topics?.name || t.name).join(', ')}, here are some projects you might like.
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
            No project recommendations available yet.
            Complete more of your profile to get personalized recommendations!
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;