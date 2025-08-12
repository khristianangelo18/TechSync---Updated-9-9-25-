// frontend/src/pages/project/ProjectMembers.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';

function ProjectMembers() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    email: '',
    role: 'member'
  });

  // Check if current user is the project owner
  const isOwner = project?.owner_id === user?.id;

  // Fetch project and member data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectResponse, membersResponse] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getProjectMembers(projectId)
        ]);

        setProject(projectResponse.data.project);
        setMemberData(membersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load project members');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Add member
  const handleAddMember = async () => {
    try {
      if (!newMemberForm.email.trim()) {
        setError('Email is required');
        return;
      }

      // For demo purposes, we'll need to implement user search by email
      // For now, let's show a placeholder message
      setError('User search by email not yet implemented. Use user ID directly for testing.');
      
      // TODO: Implement user search by email endpoint
      // const userResponse = await userService.findUserByEmail(newMemberForm.email);
      // await projectService.addProjectMember(projectId, userResponse.data.user.id, newMemberForm.role);
      
      // Refresh member data
      // const membersResponse = await projectService.getProjectMembers(projectId);
      // setMemberData(membersResponse.data);
      
      // Reset form
      setNewMemberForm({ email: '', role: 'member' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding member:', error);
      setError(error.response?.data?.message || 'Failed to add member');
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await projectService.updateMemberRole(projectId, memberId, newRole);
      
      // Refresh member data
      const membersResponse = await projectService.getProjectMembers(projectId);
      setMemberData(membersResponse.data);
      
      setError(null);
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.response?.data?.message || 'Failed to update member role');
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      await projectService.removeMember(projectId, memberId);
      
      // Refresh member data
      const membersResponse = await projectService.getProjectMembers(projectId);
      setMemberData(membersResponse.data);
      
      setError(null);
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Leave project
  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) {
      return;
    }

    try {
      await projectService.leaveProject(projectId);
      // Redirect to projects page after leaving
      window.location.href = '/projects';
    } catch (error) {
      console.error('Error leaving project:', error);
      setError(error.response?.data?.message || 'Failed to leave project');
    }
  };

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
      borderBottom: '2px solid #e9ecef'
    },
    headerLeft: {
      flex: 1
    },
    headerRight: {
      display: 'flex',
      gap: '10px'
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
    button: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    leaveButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb',
      position: 'relative'
    },
    loadingState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    },
    membersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    memberCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    ownerCard: {
      border: '2px solid #007bff',
      backgroundColor: '#f8f9ff'
    },
    memberHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    memberAvatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      marginRight: '15px'
    },
    memberInfo: {
      flex: 1
    },
    memberName: {
      margin: '0 0 5px 0',
      fontSize: '18px',
      color: '#333'
    },
    memberRole: {
      marginBottom: '5px'
    },
    ownerBadge: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    roleBadge: {
      backgroundColor: '#6c757d',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    memberEmail: {
      color: '#6c757d',
      fontSize: '14px'
    },
    memberMeta: {
      color: '#6c757d',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    memberActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '500px'
    },
    modalTitle: {
      margin: '0 0 20px 0',
      fontSize: '24px',
      color: '#333'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    primaryButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    },
    stats: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    statCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      minWidth: '120px'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#007bff',
      margin: '0 0 5px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6c757d',
      margin: 0
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <h3>Loading members...</h3>
        </div>
      </div>
    );
  }

  if (!project || !memberData) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          Failed to load project or member data.
        </div>
      </div>
    );
  }

  // ✅ FIXED: Extract data with proper destructuring
  const { owner, members, total_members, role_stats } = memberData;

  // ✅ FIXED: Calculate role counts correctly (excluding owner)
  const leadCount = role_stats?.lead || members.filter(m => m.role === 'lead').length;
  const moderatorCount = role_stats?.moderator || members.filter(m => m.role === 'moderator').length; 
  const memberCount = role_stats?.member || members.filter(m => m.role === 'member').length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Members</h1>
          <p style={styles.subtitle}>
            Project team management • {total_members} member{total_members !== 1 ? 's' : ''} total
          </p>
        </div>
        <div style={styles.headerRight}>
          {isOwner && (
            <button
              style={styles.button}
              onClick={() => setShowAddModal(true)}
            >
              + Add Member
            </button>
          )}
          {!isOwner && (
            <button
              style={styles.leaveButton}
              onClick={handleLeaveProject}
            >
              Leave Project
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats - FIXED COUNTING */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{total_members}</div>
          <div style={styles.statLabel}>Total Members</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{leadCount}</div>
          <div style={styles.statLabel}>Team Leads</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{moderatorCount}</div>
          <div style={styles.statLabel}>Moderators</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{memberCount}</div>
          <div style={styles.statLabel}>Members</div>
        </div>
      </div>

      {/* Members Grid */}
      <div style={styles.membersGrid}>
        {/* Project Owner - Always shown first */}
        {owner && (
          <div style={{...styles.memberCard, ...styles.ownerCard}}>
            <div style={styles.memberHeader}>
              <div style={styles.memberAvatar}>
                {owner.full_name?.charAt(0)?.toUpperCase() || 
                 owner.username?.charAt(0)?.toUpperCase() || 'O'}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>
                  {owner.full_name || owner.username || 'Project Owner'}
                </h3>
                <div style={styles.memberRole}>
                  <span style={styles.ownerBadge}>Owner</span>
                </div>
                <div style={styles.memberEmail}>{owner.email}</div>
              </div>
            </div>
            <div style={styles.memberMeta}>
              {owner.years_experience && (
                <div>Experience: {owner.years_experience} years</div>
              )}
              <div>Since: {new Date(project.created_at).toLocaleDateString()}</div>
              {owner.github_username && (
                <div>GitHub: @{owner.github_username}</div>
              )}
            </div>
          </div>
        )}

        {/* Project Members - Excluding owner */}
        {members.map((member) => (
          <div key={member.id} style={styles.memberCard}>
            <div style={styles.memberHeader}>
              <div style={styles.memberAvatar}>
                {member.users?.full_name?.charAt(0)?.toUpperCase() || 
                 member.users?.username?.charAt(0)?.toUpperCase() || 'M'}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>
                  {member.users?.full_name || member.users?.username || 'Team Member'}
                </h3>
                <div style={styles.memberRole}>
                  <span style={styles.roleBadge}>{member.role}</span>
                </div>
                <div style={styles.memberEmail}>{member.users?.email}</div>
              </div>
            </div>
            <div style={styles.memberMeta}>
              {member.users?.years_experience && (
                <div>Experience: {member.users.years_experience} years</div>
              )}
              <div>Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
              {member.users?.github_username && (
                <div>GitHub: @{member.users.github_username}</div>
              )}
            </div>
            {isOwner && (
              <div style={styles.memberActions}>
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  style={styles.select}
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="lead">Lead</option>
                </select>
                <button
                  style={styles.leaveButton}
                  onClick={() => handleRemoveMember(
                    member.id, 
                    member.users?.full_name || member.users?.username || 'Team Member'
                  )}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Empty state if no members */}
        {(!members || members.length === 0) && (
          <div style={styles.emptyState}>
            <p>No additional members in this project yet.</p>
            {isOwner && (
              <p>Click "Add Member" to invite people to your project.</p>
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Add New Member</h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={newMemberForm.email}
                onChange={(e) => setNewMemberForm({
                  ...newMemberForm,
                  email: e.target.value
                })}
                placeholder="Enter member's email"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.select}
                value={newMemberForm.role}
                onChange={(e) => setNewMemberForm({
                  ...newMemberForm,
                  role: e.target.value
                })}
              >
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.secondaryButton}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.primaryButton}
                onClick={handleAddMember}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMembers;