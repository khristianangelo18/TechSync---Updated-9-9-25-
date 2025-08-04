import React from 'react';
import { useParams } from 'react-router-dom';

function ProjectFiles() {
  const { projectId } = useParams();

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
        <h1 style={styles.title}>Files</h1>
        <p style={styles.subtitle}>Project files and document management</p>
      </div>

      <div style={styles.comingSoon}>
        <h2>File Management Coming Soon</h2>
        <p>Upload, organize, and share project files here.</p>
      </div>
    </div>
  );
}

export default ProjectFiles;