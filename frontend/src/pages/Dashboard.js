import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreateProject from './CreateProject';

function Dashboard() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleCreateClick = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreate = () => {
    setShowCreateProject(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notifications when clicking outside
  React.useEffect(() => {
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
    languageTag: {
      display: 'inline-block',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      margin: '2px',
      fontSize: '12px'
    },
    topicTag: {
      display: 'inline-block',
      backgroundColor: '#28a745',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      margin: '2px',
      fontSize: '12px'
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

  // Mock notifications data
  const notifications = [
    { id: 1, message: 'New project invitation received', time: '2 hours ago', unread: true },
    { id: 2, message: 'Friend request from John Doe', time: '1 day ago', unread: true },
    { id: 3, message: 'Your project "Web App" was approved', time: '2 days ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome back, {user?.full_name || user?.username}!</h1>
        
        <div style={styles.headerActions}>
          {/* Create Button */}
          <button 
            style={styles.createButton}
            onClick={handleCreateClick}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            <span>➕</span>
            Create
          </button>

          {/* Notification Button */}
          <div style={{ position: 'relative' }}>
            <button
              style={styles.iconButton}
              onClick={handleNotificationClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationHeader}>
                  Notifications ({unreadCount} unread)
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      style={{
                        ...styles.notificationItem,
                        backgroundColor: notification.unread ? '#f8f9fa' : 'white'
                      }}
                    >
                      <div style={{ fontWeight: notification.unread ? 'bold' : 'normal' }}>
                        {notification.message}
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px' }}>
                        {notification.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.notificationEmpty}>
                    No notifications yet
                  </div>
                )}
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
          connect with fellow developers, and continue learning.
        </p>
      </div>

      {/* User Profile Summary */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>Your Profile Summary</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Years of Experience:</strong> {user?.years_experience || 0} years
        </div>

        {user?.programming_languages && user.programming_languages.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Programming Languages:</strong>
            <div style={{ marginTop: '5px' }}>
              {user.programming_languages.map(lang => (
                <span key={lang.id} style={styles.languageTag}>
                  {lang.programming_languages.name} ({lang.proficiency_level})
                </span>
              ))}
            </div>
          </div>
        )}

        {user?.topics && user.topics.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Areas of Interest:</strong>
            <div style={{ marginTop: '5px' }}>
              {user.topics.map(topic => (
                <span key={topic.id} style={styles.topicTag}>
                  {topic.topics.name} ({topic.interest_level} interest)
                </span>
              ))}
            </div>
          </div>
        )}

        {user?.bio && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Bio:</strong> {user.bio}
          </div>
        )}

        {user?.github_username && (
          <div style={{ marginBottom: '15px' }}>
            <strong>GitHub:</strong> @{user.github_username}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>📊 Quick Stats</h3>
          <div style={{ color: '#666' }}>
            <div>Active Projects: 0</div>
            <div>Completed Projects: 0</div>
            <div>Friends: 0</div>
            <div>Learning Modules: 0</div>
          </div>
        </div>
        
        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>🎯 Recent Activity</h3>
          <p style={{ color: '#666', margin: 0 }}>
            No recent activity yet. Start by joining a project or connecting with other developers!
          </p>
        </div>
      </div>

      {/* Placeholder sections for future features */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>🚀 Recommended Projects</h3>
        <p style={{ color: '#666' }}>
          Based on your skills in {user?.programming_languages?.slice(0, 2).map(l => l.programming_languages.name).join(', ')} and your interest in {user?.topics?.slice(0, 2).map(t => t.topics.name).join(', ')}, we'll recommend relevant projects here.
        </p>
        <div style={{ marginTop: '15px' }}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}>
            Browse All Projects
          </button>
        </div>
      </div>

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
    </div>
  );
}

export default Dashboard;