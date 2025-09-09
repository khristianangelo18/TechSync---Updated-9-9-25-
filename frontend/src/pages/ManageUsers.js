// frontend/src/pages/ManageUsers.js - ALIGNED WITH DASHBOARD THEME
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAPI from '../services/adminAPI';
import { Users, Shield, UserX, UserCheck, Settings } from 'lucide-react';

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

  // Color variants for user cards - matching dashboard
  const colorVariants = ['slate', 'zinc', 'neutral', 'stone', 'gray', 'blue'];

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

  const renderUserCard = (user, index) => {
    const colorVariant = colorVariants[index % colorVariants.length];
    const cardColorStyles = styles.userCardVariants[colorVariant] || styles.userCardVariants.slate;

    return (
      <div
        key={user.id}
        style={{
          ...styles.userCard,
          ...cardColorStyles.base
        }}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, cardColorStyles.hover);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, cardColorStyles.base);
        }}
      >
        <div style={styles.userHeader}>
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
              <div style={styles.userMetaEmail}>{user.email}</div>
            </div>
          </div>
          
          <div style={styles.userBadges}>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: getRoleColor(user.role)
            }}>
              {user.role.toUpperCase()}
            </span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(user)
            }}>
              {getStatusText(user)}
            </span>
          </div>
        </div>
        
        <div style={styles.userMeta}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Joined: {formatDate(user.created_at)}</span>
          </div>
          
          {user.suspension_reason && (
            <div style={styles.suspensionReason}>
              <span style={styles.suspensionLabel}>Suspension reason:</span>
              <span style={styles.suspensionText}>{user.suspension_reason}</span>
            </div>
          )}
        </div>
        
        <div style={styles.userActions}>
          {canModifyUser(user) ? (
            <>
              {user.is_suspended ? (
                <button
                  style={styles.unsuspendButton}
                  onClick={() => handleAction(user, 'unsuspend')}
                  title="Unsuspend user"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#22c55e';
                  }}
                >
                  Unsuspend
                </button>
              ) : (
                <button
                  style={styles.suspendButton}
                  onClick={() => handleAction(user, 'suspend')}
                  title="Suspend user"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d97706';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                  }}
                >
                  Suspend
                </button>
              )}
              
              {user.is_active ? (
                <button
                  style={styles.kickButton}
                  onClick={() => handleAction(user, 'kick')}
                  title="Deactivate user"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c53030';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc3545';
                  }}
                >
                  Kick
                </button>
              ) : (
                <button
                  style={styles.activateButton}
                  onClick={() => handleAction(user, 'activate')}
                  title="Activate user"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0891b2';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#0ea5e9';
                  }}
                >
                  Activate
                </button>
              )}
              
              <button
                style={styles.roleButton}
                onClick={() => handleAction(user, 'changeRole')}
                title="Change user role"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#8b5cf6';
                }}
              >
                Role
              </button>
              
              {/* Delete Button - Only show for inactive users */}
              {canDeleteUser(user) && (
                <button
                  style={styles.deleteButton}
                  onClick={() => handleAction(user, 'delete')}
                  title="Permanently delete user"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#7f1d1d';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#991b1b';
                  }}
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <span style={styles.protectedLabel}>
              {user.id === currentUser.id ? 'You' : 'Protected'}
            </span>
          )}
        </div>
      </div>
    );
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
              <p style={styles.modalText}>You are about to suspend this user. They will not be able to access the platform until unsuspended.</p>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Reason for suspension:</label>
                <textarea
                  style={styles.textarea}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Duration (minutes):</label>
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
          return <p style={styles.modalText}>Are you sure you want to unsuspend {selectedUser.username}? They will be able to access the platform again.</p>;
          
        case 'kick':
          return <p style={styles.modalText}>Are you sure you want to deactivate {selectedUser.username}? They will not be able to access the platform until reactivated.</p>;
          
        case 'activate':
          return <p style={styles.modalText}>Are you sure you want to activate {selectedUser.username}? They will be able to access the platform.</p>;
          
        case 'changeRole':
          return (
            <div>
              <p style={styles.modalText}>Change the role for {selectedUser.username}:</p>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Role:</label>
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
              <p style={styles.modalText}>You are about to permanently delete the user <strong>{selectedUser.username}</strong>. This will:</p>
              <ul style={styles.warningList}>
                <li>Delete all user data permanently</li>
                <li>Remove user from all projects</li>
                <li>Delete all user activity and contributions</li>
                <li>Cannot be reversed</li>
              </ul>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
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
          return <p style={styles.modalText}>Are you sure you want to perform this action?</p>;
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
      <div style={styles.modalOverlay} onClick={closeModal}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.modalTitle}>{getModalTitle()}</h3>
          <div style={styles.modalBody}>
            {getModalContent()}
            {error && (
              <div style={styles.modalError}>
                {error}
              </div>
            )}
          </div>
          <div style={styles.modalActions}>
            <button
              style={styles.secondaryButton}
              onClick={closeModal}
              disabled={processing}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
              }}
            >
              Cancel
            </button>
            <button
              style={{
                ...getButtonColor(),
                ...(isConfirmDisabled() ? styles.disabledButton : {})
              }}
              onClick={executeAction}
              disabled={isConfirmDisabled()}
              onMouseEnter={(e) => {
                if (!isConfirmDisabled()) {
                  if (actionType === 'delete' || actionType === 'kick' || actionType === 'suspend') {
                    e.target.style.backgroundColor = '#7f1d1d';
                  } else {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isConfirmDisabled()) {
                  e.target.style.backgroundColor = getButtonColor().backgroundColor;
                }
              }}
            >
              {processing ? 'Processing...' : (actionType === 'delete' ? 'Delete Permanently' : 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  });

  const styles = {
    container: {
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px',
      marginLeft: '-150px'
    },
    backgroundSymbols: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px',
      textAlign: 'center',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#d1d5db',
      margin: 0
    },
    successMessage: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
      color: '#4ade80',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      backdropFilter: 'blur(20px)'
    },
    errorMessage: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#f87171',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      backdropFilter: 'blur(20px)'
    },
    filtersContainer: {
      position: 'relative',
      zIndex: 10,
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      alignItems: 'end'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#d1d5db'
    },
    input: {
      padding: '10px 14px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    select: {
      padding: '10px 14px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      cursor: 'pointer',
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '16px',
      paddingRight: '40px'
    },
    clearButton: {
      padding: '10px 20px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    usersGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    userCard: {
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    // User card variants matching dashboard
    userCardVariants: {
      slate: {
        base: {
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
          border: '1px solid rgba(51, 65, 85, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(51, 65, 85, 0.25)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.18), rgba(30, 41, 59, 0.12))'
        }
      },
      zinc: {
        base: {
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.12), rgba(39, 39, 42, 0.08))',
          border: '1px solid rgba(63, 63, 70, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(63, 63, 70, 0.25)',
          border: '1px solid rgba(63, 63, 70, 0.4)',
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.18), rgba(39, 39, 42, 0.12))'
        }
      },
      neutral: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        }
      },
      stone: {
        base: {
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.12), rgba(41, 37, 36, 0.08))',
          border: '1px solid rgba(68, 64, 60, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(68, 64, 60, 0.25)',
          border: '1px solid rgba(68, 64, 60, 0.4)',
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.18), rgba(41, 37, 36, 0.12))'
        }
      },
      gray: {
        base: {
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.12), rgba(31, 41, 55, 0.08))',
          border: '1px solid rgba(55, 65, 81, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(55, 65, 81, 0.25)',
          border: '1px solid rgba(55, 65, 81, 0.4)',
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.18), rgba(31, 41, 55, 0.12))'
        }
      },
      blue: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        }
      }
    },
    userHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      flex: 1
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '18px',
      marginRight: '16px',
      flexShrink: 0,
      border: '2px solid rgba(59, 130, 246, 0.3)'
    },
    userDetails: {
      flex: 1,
      minWidth: 0
    },
    userName: {
      fontWeight: '600',
      color: 'white',
      fontSize: '16px',
      margin: '0 0 4px 0'
    },
    userEmail: {
      fontSize: '14px',
      color: '#9ca3af',
      margin: '0 0 2px 0'
    },
    userMetaEmail: {
      fontSize: '12px',
      color: '#6b7280'
    },
    userBadges: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignItems: 'flex-end'
    },
    statusOnlyBadge: {
      display: 'flex',
      alignItems: 'flex-end'
    },
    roleBadge: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center'
    },
    userMeta: {
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    roleSection: {
      display: 'flex',
      alignItems: 'center'
    },
    joinedSection: {
      display: 'flex',
      alignItems: 'center'
    },
    metaItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
      marginBottom: '4px'
    },
    metaLabel: {
      color: '#9ca3af',
      fontWeight: '500',
    },
    suspensionReason: {
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    suspensionLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#f87171',
      display: 'block',
      marginBottom: '4px'
    },
    suspensionText: {
      fontSize: '12px',
      color: '#fca5a5',
      lineHeight: '1.4'
    },
    userActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    suspendButton: {
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    unsuspendButton: {
      backgroundColor: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    kickButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    activateButton: {
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    roleButton: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    deleteButton: {
      backgroundColor: '#991b1b',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    protectedLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontStyle: 'italic'
    },
    loading: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px',
      fontSize: '18px',
      color: '#9ca3af'
    },
    emptyState: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px',
      color: '#9ca3af',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: '#1a1c20',
      padding: '30px',
      borderRadius: '16px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80%',
      overflow: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '20px'
    },
    modalBody: {
      marginBottom: '24px'
    },
    modalText: {
      color: '#d1d5db',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '16px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    formLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#d1d5db',
      marginBottom: '6px'
    },
    textarea: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)'
    },
    deleteConfirmationInput: {
      width: '100%',
      padding: '10px 14px',
      border: '2px solid #dc3545',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(220, 53, 69, 0.05)',
      color: 'white'
    },
    warningText: {
      color: '#f87171',
      fontWeight: 'bold',
      marginBottom: '12px',
      fontSize: '16px'
    },
    warningList: {
      marginLeft: '20px',
      marginBottom: '20px',
      color: '#d1d5db',
      fontSize: '14px'
    },
    modalError: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#f87171',
      padding: '12px 16px',
      borderRadius: '8px',
      marginTop: '16px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      fontSize: '14px'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    primaryButton: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    dangerButton: {
      padding: '12px 24px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    secondaryButton: {
      padding: '12px 24px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div style={styles.container}>
        {/* Background Code Symbols - identical to Dashboard */}
        <div style={styles.backgroundSymbols}>
          <div style={{
            ...styles.codeSymbol,
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
        </div>

        <div style={styles.emptyState}>
          <h2>Access Denied</h2>
          <p>You need admin privileges to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Inject global styles for select dropdowns */}
      <style dangerouslySetInnerHTML={{
        __html: `
          select option {
            background-color: #1a1c20 !important;
            color: white !important;
            padding: 8px 12px !important;
            border: none !important;
            font-size: 14px !important;
          }
          
          select option:hover {
            background-color: #2563eb !important;
            color: white !important;
          }
          
          select option:checked {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          
          select:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
          }

          /* Custom scrollbar for select dropdowns */
          select::-webkit-scrollbar {
            width: 8px;
          }
          
          select::-webkit-scrollbar-track {
            background: #1a1c20;
          }
          
          select::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 4px;
          }
        `
      }} />
      
      {/* Background Code Symbols - identical to Dashboard */}
      <div style={styles.backgroundSymbols}>
        <div style={{
          ...styles.codeSymbol,
          left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
        }}>&#60;/&#62;</div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Users size={28} style={{ color: '#3b82f6' }} />
          Manage Users
        </h1>
        <p style={styles.subtitle}>View and manage user accounts, roles, and permissions</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && !showModal && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search Users</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Search by username, email, or name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Role</label>
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
            <label style={styles.filterLabel}>Status</label>
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
            <label style={styles.filterLabel}>Suspended</label>
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
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div style={styles.loading}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <div style={styles.usersGrid}>
          {users.map((user, index) => renderUserCard(user, index))}
        </div>
      )}

      {/* Action Modal */}
      <ActionModal />
    </div>
  );
};

export default ManageUsers;