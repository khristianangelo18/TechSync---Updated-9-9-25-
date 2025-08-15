// frontend/src/pages/project/ProjectMembers.js - FIXED VERSION (No Add Member)
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

  // Calculate member counts
  const members = memberData || [];
  const owner = project?.owner || null;
  const total_members = members.length + (owner ? 1 : 0);
  const leadCount = members.filter(member => member.role === 'lead').length;
  const moderatorCount = members.filter(member => member.role === 'moderator').length;
  const memberCount = members.filter(member => member.role === 'member').length;

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading project members...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Project Members</h1>
          <p style={styles.subtitle}>
            {total_members} member{total_members !== 1 ? 's' : ''} total
          </p>
        </div>
        <div style={styles.headerRight}>
          {/* REMOVED: Add Member button */}
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

      {/* Stats */}
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
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt={owner.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                ) : (
                  (owner.full_name || owner.username || 'O').charAt(0).toUpperCase()
                )}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>{owner.full_name || owner.username}</h3>
                <div style={styles.memberRole}>
                  <span style={styles.ownerBadge}>Project Owner</span>
                </div>
                <div style={styles.memberEmail}>{owner.email}</div>
              </div>
            </div>
            <div style={styles.memberMeta}>
              <div>GitHub: {owner.github_username || 'Not provided'}</div>
              <div>Experience: {owner.years_experience ? `${owner.years_experience} years` : 'Not specified'}</div>
            </div>
          </div>
        )}

        {/* Regular Members */}
        {members.map((member) => (
          <div key={member.id} style={styles.memberCard}>
            <div style={styles.memberHeader}>
              <div style={styles.memberAvatar}>
                {member.users?.avatar_url ? (
                  <img src={member.users.avatar_url} alt={member.users.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                ) : (
                  (member.users?.full_name || member.users?.username || 'M').charAt(0).toUpperCase()
                )}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>{member.users?.full_name || member.users?.username}</h3>
                <div style={styles.memberRole}>
                  <span style={styles.roleBadge}>{member.role || 'member'}</span>
                </div>
                <div style={styles.memberEmail}>{member.users?.email}</div>
              </div>
            </div>
            <div style={styles.memberMeta}>
              <div>GitHub: {member.users?.github_username || 'Not provided'}</div>
              <div>Experience: {member.users?.years_experience ? `${member.users.years_experience} years` : 'Not specified'}</div>
              <div>Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
              <div>Contribution Score: {member.contribution_score || 0}</div>
            </div>

            {/* Member Actions */}
            {(isOwner || (user?.id === member.user_id)) && (
              <div style={styles.memberActions}>
                {/* Update Role - Only owner can do this */}
                {isOwner && member.user_id !== user?.id && (
                  <select
                    style={styles.roleSelect}
                    value={member.role || 'member'}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                    <option value="lead">Lead</option>
                  </select>
                )}

                {/* Remove Member - Owner or user themselves */}
                {(isOwner || user?.id === member.user_id) && (
                  <button
                    style={styles.dangerButton}
                    onClick={() => handleRemoveMember(member.id, member.users?.full_name || member.users?.username)}
                  >
                    {user?.id === member.user_id ? 'Leave Project' : 'Remove'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {members.length === 0 && !owner && (
          <div style={styles.emptyState}>
            <h3>No members found</h3>
            <p>This project doesn't have any members yet.</p>
          </div>
        )}
      </div>

      {/* REMOVED: Add Member Modal */}
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: 'flex',
    gap: '10px'
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    color: '#333'
  },
  subtitle: {
    margin: 0,
    color: '#6c757d',
    fontSize: '16px'
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
    border: '1px solid #f5c6cb'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '500'
  },
  membersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  memberCard: {
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
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
  roleSelect: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6c757d'
  }
};

export default ProjectMembers;