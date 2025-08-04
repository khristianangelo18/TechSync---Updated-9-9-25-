import React from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
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
      <Sidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default Layout;