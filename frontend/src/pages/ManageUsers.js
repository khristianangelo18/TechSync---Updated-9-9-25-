// frontend/src/pages/ManageUsers.js
import React, { useState, useEffect, useCallback } from 'react';
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
  const [deleteConfirmation, setDeleteConfirmation] = useState(''); // For delete confirmation
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

  const handleDeleteConfirmationChange = useCallback((e) => {
    setDeleteConfirmation(e.target.value);
  }, []);

  const handleAction = useCallback((user, action) => {
    setSelectedUser(user);
    setActionType(action);
    
    if (action === 'changeRole') {
      setNewRole(user.role);
    }
    
    // Reset delete confirmation when opening modal
    if (action === 'delete') {
      setDeleteConfirmation('');
    }
    
    setShowModal(true);
  }, []);

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
          
        case 'delete':
          // Validate delete confirmation
          if (deleteConfirmation !== selectedUser.username) {
            setError(`Please type "${selectedUser.username}" to confirm deletion`);
            return;
          }
          
          // Call delete API endpoint
          const deleteResponse = await AdminAPI.deleteUser(selectedUser.id);
          
          if (deleteResponse.success) {
            setSuccessMessage(`User ${selectedUser.username} has been permanently deleted`);
            setShowModal(false);
            resetModal();
            fetchUsers(); // Refresh the users list
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
            return; // Exit early since delete doesn't use updateUser
          } else {
            setError(deleteResponse.message || 'Failed to delete user');
            return;
          }
          
        default:
          setError('Invalid action type');
          return;
      }
      
      // For non-delete actions, use updateUser
      if (actionType !== 'delete') {
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
      } else if (error.response?.status === 404) {
        setError('User not found. They may have already been deleted.');
      } else {
        setError(error.response?.data?.message || error.message || 'An unexpected error occurred');
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
    setDeleteConfirmation('');
    setError('');
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

  const canModifyUser = (user) => {
    // Prevent admin from modifying their own account or other admins (unless they're super admin)
    return user.id !== currentUser.id && (user.role !== 'admin' || currentUser.role === 'super_admin');
  };

  const canDeleteUser = (user) => {
    // Only allow deletion if user is not admin, not current user, and not the last admin
    return user.id !== currentUser.id && 
           user.role !== 'admin' && 
           !user.is_active; // Only allow deletion of inactive users for safety
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    if (user.is_suspended) return 'SUSPENDED';
    if (!user.is_active) return 'INACTIVE';
    return 'ACTIVE';
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666'
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
      gridTemplateColumns: '1fr 1fr 100px 120px 120px 200px',
      gap: '15px',
      alignItems: 'center'
    },
    userRow: {
      padding: '15px 20px',
      borderBottom: '1px solid #f1f3f4',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 100px 120px 120px 200px',
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
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      marginRight: '12px'
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    userName: {
      fontWeight: '500',
      color: '#333',
      fontSize: '14px'
    },
    userEmail: {
      fontSize: '12px',
      color: '#666'
    },
    roleBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    suspendButton: {
      backgroundColor: '#ffc107',
      color: '#212529'
    },
    unsuspendButton: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    kickButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    activateButton: {
      backgroundColor: '#17a2b8',
      color: 'white'
    },
    roleButton: {
      backgroundColor: '#6f42c1',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: '2px solid #c82333'
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80%',
      overflow: 'auto'
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
    deleteConfirmationInput: {
      width: '100%',
      padding: '10px',
      border: '2px solid #dc3545',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'monospace'
    },
    warningText: {
      color: '#dc3545',
      fontWeight: 'bold',
      marginBottom: '10px'
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

  const ActionModal = React.memo(() => {
    if (!showModal || !selectedUser) return null;

    const getModalTitle = () => {
      switch (actionType) {
        case 'suspend': return `Suspend ${selectedUser.username}`;
        case 'unsuspend': return `Unsuspend ${selectedUser.username}`;
        case 'kick': return `Deactivate ${selectedUser.username}`;
        case 'activate': return `Activate ${selectedUser.username}`;
        case 'changeRole': return `Change Role for ${selectedUser.username}`;
        case 'delete': return `Delete ${selectedUser.username}`;
        default: return 'Confirm Action';
      }
    };

    const getModalContent = () => {
      switch (actionType) {
        case 'suspend':
          return (
            <div>
              <p>You are about to suspend this user. They will not be able to access the platform until unsuspended.</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reason for suspension:</label>
                <textarea
                  style={styles.textarea}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration (minutes):</label>
                <input
                  type="number"
                  style={styles.input}
                  value={suspensionDuration}
                  onChange={(e) => setSuspensionDuration(e.target.value)}
                  min="1"
                  max="525600"
                  required
                />
              </div>
            </div>
          );
          
        case 'unsuspend':
          return <p>Are you sure you want to unsuspend {selectedUser.username}? They will be able to access the platform again.</p>;
          
        case 'kick':
          return <p>Are you sure you want to deactivate {selectedUser.username}? They will not be able to access the platform until reactivated.</p>;
          
        case 'activate':
          return <p>Are you sure you want to activate {selectedUser.username}? They will be able to access the platform.</p>;
          
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
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          );
          
        case 'delete':
          return (
            <div>
              <div style={styles.warningText}>
                ⚠️ WARNING: This action cannot be undone!
              </div>
              <p>You are about to permanently delete the user <strong>{selectedUser.username}</strong>. This will:</p>
              <ul style={{ marginLeft: '20px', marginBottom: '15px', color: '#666' }}>
                <li>Delete all user data permanently</li>
                <li>Remove user from all projects</li>
                <li>Delete all user activity and contributions</li>
                <li>Cannot be reversed</li>
              </ul>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Type <strong>{selectedUser.username}</strong> to confirm:
                </label>
                <input
                  type="text"
                  style={styles.deleteConfirmationInput}
                  value={deleteConfirmation}
                  onChange={handleDeleteConfirmationChange}
                  placeholder={`Type "${selectedUser.username}" here`}
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>
          );
          
        default:
          return <p>Are you sure you want to perform this action?</p>;
      }
    };

    const getButtonColor = () => {
      return actionType === 'delete' || actionType === 'kick' || actionType === 'suspend' ? 
        styles.dangerButton : styles.primaryButton;
    };

    const isConfirmDisabled = () => {
      if (processing) return true;
      if (actionType === 'suspend' && !suspensionReason.trim()) return true;
      if (actionType === 'delete' && deleteConfirmation !== selectedUser.username) return true;
      return false;
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
              disabled={isConfirmDisabled()}
            >
              {processing ? 'Processing...' : (actionType === 'delete' ? 'Delete Permanently' : 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  });

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
                    
                    {/* Delete Button - Only show for inactive users */}
                    {canDeleteUser(user) && (
                      <button
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        onClick={() => handleAction(user, 'delete')}
                        title="Permanently delete user"
                      >
                        Delete
                      </button>
                    )}
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