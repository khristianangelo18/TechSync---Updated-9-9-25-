// frontend/src/pages/soloproject/SoloProjectLayout.js
import React from 'react';
import SoloProjectSidebar from './SoloProjectSidebar';

function SoloProjectLayout({ children }) {
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
      <SoloProjectSidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default SoloProjectLayout;