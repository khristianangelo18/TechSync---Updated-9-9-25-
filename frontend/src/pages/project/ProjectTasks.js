import React from 'react';
// Removed unused useParams import and projectId variable

function ProjectTasks() {
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
    comingSoon: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tasks</h1>
        <p style={styles.subtitle}>Project task management and tracking</p>
      </div>

      <div style={styles.comingSoon}>
        <h2>Task Management Coming Soon</h2>
        <p>Create, assign, and track project tasks here.</p>
      </div>
    </div>
  );
}

export default ProjectTasks;