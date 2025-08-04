import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';

function ProjectMembers() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getProjectById(projectId);
        setProject(response.data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
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
    membersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    memberCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      marginRight: '15px'
    },
    memberInfo: {
      flex: 1
    },
    memberName: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 5px 0'
    },
    memberRole: {
      fontSize: '14px',
      color: '#6c757d',
      textTransform: 'capitalize'
    },
    memberMeta: {
      fontSize: '12px',
      color: '#6c757d'
    },
    ownerBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      backgroundColor: '#28a745',
      color: 'white',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '18px',
      color: '#6c757d'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading team members...</div>;
  }

  if (!project) {
    return <div style={styles.loading}>Project not found</div>;
  }

  const owner = project.users;
  const members = project.project_members || [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Members</h1>
        <p style={styles.subtitle}>Project team members and collaborators</p>
      </div>

      <div style={styles.membersGrid}>
        {/* Project Owner */}
        {owner && (
          <div style={styles.memberCard}>
            <div style={styles.memberHeader}>
              <div style={styles.memberAvatar}>
                {owner.full_name?.charAt(0)?.toUpperCase() || 
                 owner.username?.charAt(0)?.toUpperCase() || 'O'}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>
                  {owner.full_name || owner.username}
                </h3>
                <div style={styles.memberRole}>
                  <span style={styles.ownerBadge}>Owner</span>
                </div>
              </div>
            </div>
            <div style={styles.memberMeta}>
              {owner.years_experience && (
                <div>Experience: {owner.years_experience} years</div>
              )}
              <div>Joined: {new Date(project.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        )}

        {/* Project Members */}
        {members.map((member, index) => (
          <div key={member.id || index} style={styles.memberCard}>
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
                  {member.role || 'Member'}
                </div>
              </div>
            </div>
            <div style={styles.memberMeta}>
              {member.users?.years_experience && (
                <div>Experience: {member.users.years_experience} years</div>
              )}
              {member.joined_at && (
                <div>Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
              )}
              {member.contribution_score && (
                <div>Contribution Score: {member.contribution_score}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state if no additional members */}
      {members.length === 0 && (
        <div style={styles.emptyState}>
          <h2>Looking for Team Members</h2>
          <p>This project is currently looking for collaborators. Share the project to invite more team members!</p>
        </div>
      )}
    </div>
  );
}

export default ProjectMembers;