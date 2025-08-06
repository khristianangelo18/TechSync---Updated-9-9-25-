// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminAPI from '../services/adminAPI'; // Add this import

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Always call hooks first - before any conditional returns
  useEffect(() => {
    // Only fetch data if user is admin/moderator
    if (user?.role === 'admin' || user?.role === 'moderator') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Use AdminAPI service instead of direct fetch
      const response = await AdminAPI.getDashboardStats();
      
      if (response.success) {
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        setError('Access denied. You need admin privileges to view this data.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = '#007bff' }) => (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={styles.statHeader}>
        <span style={styles.statIcon}>{icon}</span>
        <h3 style={styles.statTitle}>{title}</h3>
      </div>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div style={styles.activityItem}>
      <div style={styles.activityHeader}>
        <span style={styles.activityUser}>
          {activity.users?.full_name || activity.users?.username || 'Unknown Admin'}
        </span>
        <span style={styles.activityTime}>
          {new Date(activity.created_at).toLocaleString()}
        </span>
      </div>
      <div style={styles.activityAction}>
        {activity.action.replace(/_/g, ' ').toLowerCase()}
      </div>
      {activity.resource_type && (
        <div style={styles.activityResource}>
          Resource: {activity.resource_type}
        </div>
      )}
    </div>
  );

  const styles = {
    container: {
      padding: '30px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      margin: 0
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    statIcon: {
      fontSize: '24px',
      marginRight: '10px'
    },
    statTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#666',
      margin: 0
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '25px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #e9ecef'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '30px'
    },
    actionButton: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'block'
    },
    activityItem: {
      padding: '12px 0',
      borderBottom: '1px solid #e9ecef'
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '5px'
    },
    activityUser: {
      fontWeight: '600',
      color: '#333'
    },
    activityTime: {
      fontSize: '12px',
      color: '#666'
    },
    activityAction: {
      fontSize: '14px',
      color: '#495057'
    },
    activityResource: {
      color: '#6c757d',
      fontSize: '12px'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      fontSize: '18px',
      color: '#666'
    },
    error: {
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    unauthorized: {
      textAlign: 'center',
      padding: '60px',
      backgroundColor: 'white',
      borderRadius: '8px',
      margin: '50px auto',
      maxWidth: '500px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    retryButton: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginTop: '10px'
    }
  };

  // Check authorization after hooks are called
  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div style={styles.unauthorized}>
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.loading}>Loading admin dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          🛡️ Admin Dashboard
        </h1>
        <p style={styles.subtitle}>
          Welcome back, {user?.full_name || user?.username}! Here's what's happening on your platform.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <br />
          <button 
            style={styles.retryButton}
            onClick={fetchDashboardData}
          >
            Retry
          </button>
        </div>
      )}

      {stats && (
        <div style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || '0'}
            icon="👥"
            color="#28a745"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects?.toLocaleString() || '0'}
            icon="📁"
            color="#007bff"
          />
          <StatCard
            title="Total Challenges"
            value={stats.totalChallenges?.toLocaleString() || '0'}
            icon="🧩"
            color="#17a2b8"
          />
          <StatCard
            title="New Users (30d)"
            value={stats.recentRegistrations?.toLocaleString() || '0'}
            icon="🆕"
            color="#ffc107"
          />
          <StatCard
            title="Suspended Users"
            value={stats.suspendedUsers?.toLocaleString() || '0'}
            icon="🚫"
            color="#dc3545"
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects?.toLocaleString() || '0'}
            icon="📊"
            color="#6f42c1"
          />
        </div>
      )}

      <div style={styles.contentGrid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActions}>
            <button 
              style={styles.actionButton}
              onClick={() => navigate('/admin/users')}
            >
              👥 Manage Users
            </button>
            <button style={styles.actionButton}>
              📁 Manage Projects
            </button>
            <button style={styles.actionButton}>
              🧩 Manage Challenges
            </button>
            <button style={styles.actionButton}>
              ⚙️ System Settings
            </button>
            <button style={styles.actionButton}>
              📊 View Reports
            </button>
            <button style={styles.actionButton}>
              📋 Activity Logs
            </button>
          </div>

          <h2 style={styles.sectionTitle}>Recent Admin Activity</h2>
          {recentActivity && recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={`${activity.id}-${index}`} activity={activity} />
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No recent admin activity
            </p>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>System Status</h2>
          <div>
            <div style={{ marginBottom: '15px' }}>
              <strong>System Status:</strong>
              <span style={{ color: '#28a745', marginLeft: '10px' }}>🟢 Online</span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Database:</strong>
              <span style={{ color: '#28a745', marginLeft: '10px' }}>🟢 Connected</span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>User Registration:</strong>
              <span style={{ color: '#28a745', marginLeft: '10px' }}>🟢 Enabled</span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Maintenance Mode:</strong>
              <span style={{ color: '#6c757d', marginLeft: '10px' }}>⚫ Disabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;