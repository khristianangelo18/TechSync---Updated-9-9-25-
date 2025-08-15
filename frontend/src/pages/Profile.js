// frontend/src/pages/Profile.js - UPDATED WITH MIGRATED DASHBOARD CONTENT
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';

function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    github_username: '',
    linkedin_url: '',
    years_experience: 0
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  // NEW: Project statistics state (migrated from Dashboard)
  const [projectStats, setProjectStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    friends: 0,
    learningModules: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        github_username: user.github_username || '',
        linkedin_url: user.linkedin_url || '',
        years_experience: user.years_experience || 0
      });
    }
  }, [user]);

  // NEW: Fetch project statistics (migrated from Dashboard)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(formData);
      setUser(response.data.user);
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      showNotification('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionPercentage = () => {
    if (!user) return 0;
    
    const fields = [
      user.full_name,
      user.bio,
      user.github_username,
      user.years_experience > 0,
      user.programming_languages?.length > 0,
      user.topics?.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    notification: {
      padding: '12px 20px',
      borderRadius: '6px',
      marginBottom: '20px',
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    },
    notificationSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    notificationError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    header: {
      marginBottom: '30px'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    editButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '20px',
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    avatarLarge: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      flexShrink: 0
    },
    userDetails: {
      flex: 1
    },
    userName: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 8px 0'
    },
    userMeta: {
      color: '#666',
      fontSize: '14px',
      margin: '0 0 16px 0'
    },
    progressContainer: {
      marginTop: '12px'
    },
    progressLabel: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '6px'
    },
    progressBar: {
      width: '200px',
      height: '8px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#007bff',
      transition: 'width 0.3s ease'
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px',
      alignItems: 'start'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    section: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 20px 0'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginRight: '10px',
      transition: 'background-color 0.2s ease'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    changePasswordButton: {
      backgroundColor: '#ffc107',
      color: '#212529',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    statCard: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid #e9ecef'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#007bff',
      margin: '0 0 4px 0'
    },
    statLabel: {
      fontSize: '12px',
      color: '#666',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoCard: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#333',
      border: '1px solid #e9ecef'
    },
    // NEW: Migrated Dashboard Overview Styles
    overviewSection: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginBottom: '20px'
    },
    overviewTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userInfoContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
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
      opacity: 0.8
    },
    emptySkills: {
      color: '#666',
      fontSize: '14px',
      fontStyle: 'italic'
    },
    // NEW: Stats Container (migrated from Dashboard)
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    dashboardStatCard: {
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
    statLabelDashboard: {
      color: '#666',
      fontSize: '14px'
    },
    // NEW: Recent Activity styles (migrated from Dashboard)
    activitySection: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
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
      {/* Notification */}
      {notification.message && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'success' ? 
            styles.notificationSuccess : styles.notificationError)
        }}>
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>Profile</h1>
          <button
            style={styles.editButton}
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>
            {user?.full_name?.charAt(0)?.toUpperCase() || 
             user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={styles.userDetails}>
            <h2 style={styles.userName}>
              {user?.full_name || user?.username || 'User'}
            </h2>
            <p style={styles.userMeta}>
              @{user?.username} • Joined {new Date(user?.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div style={styles.progressContainer}>
              <div style={styles.progressLabel}>
                Profile Completion: {getProfileCompletionPercentage()}%
              </div>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${getProfileCompletionPercentage()}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Dashboard Overview Section (migrated from Dashboard) */}
      <div style={styles.overviewSection}>
        <h3 style={styles.overviewTitle}>
          🎯 Dashboard Overview
        </h3>
        
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

        {/* NEW: Quick Stats (migrated from Dashboard) */}
        <div style={styles.statsContainer}>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.activeProjects}
            </div>
            <div style={styles.statLabelDashboard}>Active Projects</div>
          </div>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.completedProjects}
            </div>
            <div style={styles.statLabelDashboard}>Completed Projects</div>
          </div>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.friends}
            </div>
            <div style={styles.statLabelDashboard}>Friends</div>
          </div>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.learningModules}
            </div>
            <div style={styles.statLabelDashboard}>Learning Modules</div>
          </div>
        </div>

        {/* NEW: Recent Activity (migrated from Dashboard) */}
        <div style={styles.activitySection}>
          <h3 style={styles.sectionTitle}>🎯 Recent Activity</h3>
          <div style={styles.emptyState}>
            No recent activity yet. Start by joining a project or connecting with other developers!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.mainContent}>
          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your full name"
                />
              ) : (
                <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                  {user?.full_name || 'Not specified'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p style={{ margin: 0, color: '#333', fontSize: '14px', lineHeight: '1.5' }}>
                  {user?.bio || 'No bio provided'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Years of Experience</label>
              {isEditing ? (
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="0"
                  max="50"
                />
              ) : (
                <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                  {user?.years_experience || 0} years
                </p>
              )}
            </div>

            {isEditing && (
              <div>
                <button
                  style={styles.primaryButton}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Social Links</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>GitHub Username</label>
              {isEditing ? (
                <input
                  type="text"
                  name="github_username"
                  value={formData.github_username}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your GitHub username"
                />
              ) : (
                <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                  {user?.github_username ? (
                    <a 
                      href={`https://github.com/${user.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      @{user.github_username}
                    </a>
                  ) : 'Not specified'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>LinkedIn URL</label>
              {isEditing ? (
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                  {user?.linkedin_url ? (
                    <a 
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      View LinkedIn Profile
                    </a>
                  ) : 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Security</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>••••••••</span>
                <button
                  style={styles.changePasswordButton}
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  Change Password
                </button>
              </div>
            </div>

            {showChangePassword && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    style={styles.input}
                  />
                </div>

                <div>
                  <button
                    style={styles.primaryButton}
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Quick Stats */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Quick Stats</h3>
            
            <div style={styles.statCard}>
              <h4 style={styles.statNumber}>{getProfileCompletionPercentage()}%</h4>
              <p style={styles.statLabel}>Profile Complete</p>
            </div>
            
            <div style={{ marginTop: '12px', ...styles.statCard }}>
              <h4 style={styles.statNumber}>
                {user?.years_experience || 0}
              </h4>
              <p style={styles.statLabel}>Years Experience</p>
            </div>

            <div style={{ marginTop: '12px', ...styles.statCard }}>
              <h4 style={styles.statNumber}>
                {new Date().getFullYear() - new Date(user?.created_at).getFullYear()}
              </h4>
              <p style={styles.statLabel}>Years on Platform</p>
            </div>
          </div>

          {/* Account Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Account Information</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Member Since</label>
              <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Last Updated</label>
              <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                {new Date(user?.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label style={styles.label}>Account ID</label>
              <p style={{ margin: 0, color: '#666', fontSize: '12px', fontFamily: 'monospace' }}>
                {user?.id}
              </p>
            </div>
          </div>

          {/* Profile Tips */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Profile Tips</h3>
            <div style={styles.infoCard}>
              <p style={{ margin: '0 0 12px 0', fontWeight: '500', color: '#333' }}>
                Complete your profile to:
              </p>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
                <li>Get better project recommendations</li>
                <li>Connect with like-minded collaborators</li>
                <li>Showcase your skills and experience</li>
                <li>Build your professional network</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .content {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;