import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

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
    const fields = [
      user?.full_name,
      user?.bio,
      user?.github_username,
      user?.linkedin_url,
      user?.years_experience !== undefined && user?.years_experience !== null
    ];
    const filledFields = fields.filter(field => field && field !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 60px)'
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    title: {
      color: '#333',
      margin: 0,
      fontSize: '32px',
      fontWeight: 'bold'
    },
    editButton: {
      padding: '10px 20px',
      backgroundColor: isEditing ? '#6c757d' : '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    avatarLarge: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white'
    },
    userDetails: {
      flex: 1
    },
    userName: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    userMeta: {
      fontSize: '14px',
      color: '#666',
      margin: '5px 0 10px 0'
    },
    progressContainer: {
      marginTop: '15px'
    },
    progressLabel: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '5px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#28a745',
      transition: 'width 0.3s ease'
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 16px 0',
      paddingBottom: '8px',
      borderBottom: '1px solid #f1f3f4'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#333',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#333',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px'
    },
    primaryButton: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      disabled: loading
    },
    secondaryButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    dangerButton: {
      padding: '10px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    infoCard: {
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.5'
    },
    statCard: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#007bff',
      margin: 0
    },
    statLabel: {
      fontSize: '12px',
      color: '#666',
      margin: '5px 0 0 0'
    },
    notification: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    },
    notificationSuccess: {
      backgroundColor: '#28a745'
    },
    notificationError: {
      backgroundColor: '#dc3545'
    }
  };

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification.message && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'success' ? styles.notificationSuccess : styles.notificationError)
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
                <p style={{ margin: 0, padding: '10px 0', color: '#333' }}>
                  {user?.full_name || 'Not provided'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <p style={{ margin: 0, padding: '10px 0', color: '#666', fontStyle: 'italic' }}>
                @{user?.username} (cannot be changed)
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <p style={{ margin: 0, padding: '10px 0', color: '#666', fontStyle: 'italic' }}>
                {user?.email} (cannot be changed)
              </p>
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
                <p style={{ margin: 0, padding: '10px 0', color: '#333', lineHeight: '1.5' }}>
                  {user?.bio || 'No bio provided'}
                </p>
              )}
            </div>

            {isEditing && (
              <div style={styles.buttonGroup}>
                <button
                  style={styles.primaryButton}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Professional Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Professional Information</h3>
            
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
                  max="100"
                />
              ) : (
                <p style={{ margin: 0, padding: '10px 0', color: '#333' }}>
                  {user?.years_experience || 0} years
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>GitHub Username</label>
              {isEditing ? (
                <input
                  type="text"
                  name="github_username"
                  value={formData.github_username}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="github-username"
                />
              ) : (
                <p style={{ margin: 0, padding: '10px 0', color: '#333' }}>
                  {user?.github_username ? (
                    <a
                      href={`https://github.com/${user.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      @{user.github_username}
                    </a>
                  ) : (
                    'Not provided'
                  )}
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
                  placeholder="https://linkedin.com/in/your-profile"
                />
              ) : (
                <p style={{ margin: 0, padding: '10px 0', color: '#333' }}>
                  {user?.linkedin_url ? (
                    <a
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      View LinkedIn Profile
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Account Security</h3>
            
            {!showChangePassword ? (
              <div>
                <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
                  Keep your account secure by using a strong password.
                </p>
                <button
                  style={styles.dangerButton}
                  onClick={() => setShowChangePassword(true)}
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    style={styles.input}
                    placeholder="Enter current password"
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
                    placeholder="Enter new password"
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
                    placeholder="Confirm new password"
                  />
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    style={styles.dangerButton}
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