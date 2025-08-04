import React from 'react';
import ProjectSidebar from './ProjectSidebar';

function ProjectLayout({ children }) {
  const styles = {
    layoutContainer: {
      display: 'flex',
      minHeight: '100vh'
    },
    mainContent: {
      flex: 1,
      marginLeft: '250px', // Width of sidebar
      backgroundColor: '#ffffff',
      overflowY: 'auto'
    }
  };

  return (
    <div style={styles.layoutContainer}>
      <ProjectSidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default ProjectLayout;