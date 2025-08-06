// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
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
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
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
      <div style={{ ...styles.statValue, color }}>{value}</div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div style={styles.activityItem}>
      <div style={styles.activityHeader}>
        <span style={styles.activityUser}>
          {activity.users?.full_name || activity.users?.username || 'Admin'}
        </span>
        <span style={styles.activityTime}>
          {new Date(activity.created_at).toLocaleString()}
        </span>
      </div>
      <div style={styles.activityAction}>
        {activity.action.replace(/_/g, ' ')} - {activity.resource_type}
        {activity.resource_id && (
          <span style={styles.activityResource}> (ID: {activity.resource_id.substring(0, 8)}...)</span>
        )}
      </div>
    </div>
  );

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
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
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    subtitle: {
      color: '#666',
      fontSize: '16px',
      marginTop: '5px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
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

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActions}>
          <button
            style={styles.actionButton}
            onClick={() => window.location.href = '/admin/users'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            👥 Manage Users
          </button>
          <button
            style={styles.actionButton}
            onClick={() => window.location.href = '/admin/projects'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            📁 View Projects
          </button>
          <button
            style={styles.actionButton}
            onClick={() => window.location.href = '/admin/challenges'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            🧩 Manage Challenges
          </button>
          <button
            style={styles.actionButton}
            onClick={() => window.location.href = '/admin/settings'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            ⚙️ System Settings
          </button>
          <button
            style={styles.actionButton}
            onClick={() => window.location.href = '/admin/activity'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            📋 Activity Logs
          </button>
          <button
            style={{...styles.actionButton, backgroundColor: '#28a745'}}
            onClick={() => window.location.href = '/challenges'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            ➕ Add Challenge
          </button>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          {recentActivity.length > 0 ? (
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