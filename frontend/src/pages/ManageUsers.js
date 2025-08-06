// frontend/src/pages/ManageUsers.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAPI from '../services/adminAPI';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState(60); // minutes
  const [newRole, setNewRole] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    suspended: '',
    page: 1,
    limit: 20
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminAPI.getUsers(filters);
      
      if (response.success) {
        setUsers(response.data.users);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    
    if (action === 'changeRole') {
      setNewRole(user.role);
    }
    
    setShowModal(true);
  };

  const executeAction = async () => {
    if (!selectedUser) return;
    
    try {
      setProcessing(true);
      setError('');
      
      // Validate user ID format (should be UUID)
      if (!selectedUser.id || typeof selectedUser.id !== 'string') {
        setError('Invalid user ID format');
        return;
      }
      
      let updateData = {};
      let successMsg = '';
      
      switch (actionType) {
        case 'suspend':
          if (!suspensionReason.trim()) {
            setError('Suspension reason is required');
            return;
          }
          if (!suspensionDuration || suspensionDuration < 1) {
            setError('Suspension duration must be at least 1 minute');
            return;
          }
          updateData = {
            is_suspended: true,
            suspension_reason: suspensionReason.trim(),
            suspension_duration: parseInt(suspensionDuration)
          };
          successMsg = `${selectedUser.username} has been suspended`;
          break;
          
        case 'unsuspend':
          updateData = {
            is_suspended: false
          };
          successMsg = `${selectedUser.username} has been unsuspended`;
          break;
          
        case 'kick':
          updateData = {
            is_active: false
          };
          successMsg = `${selectedUser.username} has been deactivated`;
          break;
          
        case 'activate':
          updateData = {
            is_active: true
          };
          successMsg = `${selectedUser.username} has been activated`;
          break;
          
        case 'changeRole':
          if (!newRole || !['user', 'moderator', 'admin'].includes(newRole)) {
            setError('Please select a valid role');
            return;
          }
          updateData = {
            role: newRole
          };
          successMsg = `${selectedUser.username}'s role changed to ${newRole}`;
          break;
          
        default:
          setError('Invalid action type');
          return;
      }
      
      // Log the data being sent for debugging
      console.log('Sending update data:', {
        userId: selectedUser.id,
        updateData: updateData
      });
      
      const response = await AdminAPI.updateUser(selectedUser.id, updateData);
      
      if (response.success) {
        setSuccessMessage(successMsg);
        setShowModal(false);
        resetModal();
        fetchUsers(); // Refresh the users list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error executing action:', error);
      
      // Handle validation errors specifically
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => `${err.param}: ${err.msg}`).join(', ');
        setError(`Validation failed: ${validationErrors}`);
      } else if (error.response?.status === 400) {
        setError(`Validation failed: ${error.response.data.message}`);
      } else if (error.response?.status === 403) {
        setError('Access denied. You may not have permission to modify this user.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (!error.response) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(error.response?.data?.message || `Action failed (${error.response?.status})`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedUser(null);
    setActionType('');
    setSuspensionReason('');
    setSuspensionDuration(60);
    setNewRole('');
  };

  const closeModal = () => {
    setShowModal(false);
    resetModal();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'moderator': return '#fd7e14';
      case 'user': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (user) => {
    if (user.is_suspended) return '#dc3545';
    if (!user.is_active) return '#6c757d';
    return '#28a745';
  };

  const getStatusText = (user) => {
    if (user.is_suspended) return 'Suspended';
    if (!user.is_active) return 'Inactive';
    return 'Active';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canModifyUser = (user) => {
    // Can't modify yourself
    if (user.id === currentUser.id) return false;
    
    // Only admins can modify other admins
    if (user.role === 'admin' && currentUser.role !== 'admin') return false;
    
    return true;
  };

  const styles = {
    container: {
      padding: '30px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      margin: 0
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #c3e6cb'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    filtersContainer: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      alignItems: 'end'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '5px'
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    clearButton: {
      padding: '8px 16px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    usersContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      padding: '15px 20px',
      fontWeight: 'bold',
      borderBottom: '1px solid #dee2e6',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 100px 120px 120px 150px',
      gap: '15px',
      alignItems: 'center'
    },
    userRow: {
      padding: '15px 20px',
      borderBottom: '1px solid #f1f3f4',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 100px 120px 120px 150px',
      gap: '15px',
      alignItems: 'center',
      transition: 'background-color 0.2s ease'
    },
    userRowHover: {
      backgroundColor: '#f8f9fa'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold',
      marginRight: '10px'
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    userEmail: {
      fontSize: '12px',
      color: '#666'
    },
    roleBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textAlign: 'center',
      color: 'white'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textAlign: 'center',
      color: 'white'
    },
    actionButtons: {
      display: 'flex',
      gap: '5px'
    },
    actionButton: {
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'opacity 0.2s ease'
    },
    suspendButton: {
      backgroundColor: '#ffc107',
      color: '#212529'
    },
    kickButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    roleButton: {
      backgroundColor: '#17a2b8',
      color: 'white'
    },
    activateButton: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    unsuspendButton: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    disabledButton: {
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      cursor: 'not-allowed'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '15px'
    },
    modalBody: {
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit'
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end'
    },
    primaryButton: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    dangerButton: {
      padding: '10px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    secondaryButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      fontSize: '18px',
      color: '#666'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px',
      color: '#666'
    }
  };

  const ActionModal = () => {
    if (!showModal || !selectedUser) return null;

    const getModalTitle = () => {
      switch (actionType) {
        case 'suspend': return `Suspend ${selectedUser.username}`;
        case 'unsuspend': return `Unsuspend ${selectedUser.username}`;
        case 'kick': return `Deactivate ${selectedUser.username}`;
        case 'activate': return `Activate ${selectedUser.username}`;
        case 'changeRole': return `Change Role for ${selectedUser.username}`;
        default: return 'Confirm Action';
      }
    };

    const getModalContent = () => {
      switch (actionType) {
        case 'suspend':
          return (
            <div>
              <p>You are about to suspend this user. They will not be able to access the platform.</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reason for suspension:</label>
                <textarea
                  style={styles.textarea}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration (minutes):</label>
                <input
                  type="number"
                  style={styles.input}
                  value={suspensionDuration}
                  onChange={(e) => setSuspensionDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="525600"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Common durations: 60 (1 hour), 1440 (1 day), 10080 (1 week)
                </small>
              </div>
            </div>
          );
          
        case 'unsuspend':
          return <p>Are you sure you want to unsuspend {selectedUser.username}? They will regain access to the platform.</p>;
          
        case 'kick':
          return <p>Are you sure you want to deactivate {selectedUser.username}? They will lose access to the platform until reactivated.</p>;
          
        case 'activate':
          return <p>Are you sure you want to activate {selectedUser.username}? They will regain access to the platform.</p>;
          
        case 'changeRole':
          return (
            <div>
              <p>Change the role for {selectedUser.username}:</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>New Role:</label>
                <select
                  style={styles.select}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  {currentUser.role === 'admin' && (
                    <option value="admin">Admin</option>
                  )}
                </select>
              </div>
            </div>
          );
          
        default:
          return <p>Unknown action</p>;
      }
    };

    const getButtonColor = () => {
      return ['suspend', 'kick'].includes(actionType) ? styles.dangerButton : styles.primaryButton;
    };

    return (
      <div style={styles.modal} onClick={closeModal}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.modalTitle}>{getModalTitle()}</h3>
          <div style={styles.modalBody}>
            {getModalContent()}
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}
          </div>
          <div style={styles.modalActions}>
            <button
              style={styles.secondaryButton}
              onClick={closeModal}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              style={getButtonColor()}
              onClick={executeAction}
              disabled={processing || (actionType === 'suspend' && !suspensionReason.trim())}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h2>Access Denied</h2>
          <p>You need admin privileges to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Manage Users</h1>
        <p style={styles.subtitle}>View and manage user accounts, roles, and permissions</p>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {error && !showModal && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Search Users</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Search by username, email, or name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.select}
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.label}>Status</label>
            <select
              style={styles.select}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.label}>Suspended</label>
            <select
              style={styles.select}
              value={filters.suspended}
              onChange={(e) => handleFilterChange('suspended', e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Suspended</option>
              <option value="false">Not Suspended</option>
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <button
              style={styles.clearButton}
              onClick={() => setFilters({
                search: '',
                role: '',
                status: '',
                suspended: '',
                page: 1,
                limit: 20
              })}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={styles.usersContainer}>
        <div style={styles.tableHeader}>
          <div>User</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              style={styles.userRow}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.userRowHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {user.full_name?.charAt(0)?.toUpperCase() || 
                   user.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={styles.userDetails}>
                  <div style={styles.userName}>
                    {user.full_name || user.username}
                  </div>
                  <div style={styles.userEmail}>@{user.username}</div>
                </div>
              </div>
              
              <div>{user.email}</div>
              
              <div>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: getRoleColor(user.role)
                }}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              
              <div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(user)
                }}>
                  {getStatusText(user)}
                </span>
                {user.suspension_reason && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    {user.suspension_reason}
                  </div>
                )}
              </div>
              
              <div>{formatDate(user.created_at)}</div>
              
              <div style={styles.actionButtons}>
                {canModifyUser(user) ? (
                  <>
                    {user.is_suspended ? (
                      <button
                        style={{ ...styles.actionButton, ...styles.unsuspendButton }}
                        onClick={() => handleAction(user, 'unsuspend')}
                        title="Unsuspend user"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        style={{ ...styles.actionButton, ...styles.suspendButton }}
                        onClick={() => handleAction(user, 'suspend')}
                        title="Suspend user"
                      >
                        Suspend
                      </button>
                    )}
                    
                    {user.is_active ? (
                      <button
                        style={{ ...styles.actionButton, ...styles.kickButton }}
                        onClick={() => handleAction(user, 'kick')}
                        title="Deactivate user"
                      >
                        Kick
                      </button>
                    ) : (
                      <button
                        style={{ ...styles.actionButton, ...styles.activateButton }}
                        onClick={() => handleAction(user, 'activate')}
                        title="Activate user"
                      >
                        Activate
                      </button>
                    )}
                    
                    <button
                      style={{ ...styles.actionButton, ...styles.roleButton }}
                      onClick={() => handleAction(user, 'changeRole')}
                      title="Change user role"
                    >
                      Role
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {user.id === currentUser.id ? 'You' : 'Protected'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ActionModal />
    </div>
  );
};

export default ManageUsers;