// frontend/src/pages/AdminDashboard.js - ALIGNED WITH DASHBOARD THEME
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminAPI from '../services/adminAPI';
import { Shield, Users, Folder, Puzzle, UserPlus, Settings, BarChart3, FileText } from 'lucide-react';

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

  const StatCard = ({ title, value, icon, color = '#3b82f6' }) => (
    <div 
      style={{ 
        ...styles.statCard, 
        borderLeft: `4px solid ${color}` 
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
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
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px',
      marginLeft: '-150px'
    },
    backgroundSymbols: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 10px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#d1d5db',
      margin: 0
    },
    statsGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      backdropFilter: 'blur(20px)',
      padding: '24px',
      borderRadius: '16px',
      transition: 'all 0.3s ease'
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
      color: '#d1d5db',
      margin: 0
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0
    },
    contentGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px'
    },
    section: {
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '30px'
    },
    actionButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    activityItem: {
      padding: '12px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '5px'
    },
    activityUser: {
      fontWeight: '600',
      color: 'white'
    },
    activityTime: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    activityAction: {
      fontSize: '14px',
      color: '#d1d5db'
    },
    activityResource: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    loading: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px',
      fontSize: '18px',
      color: '#9ca3af'
    },
    errorContainer: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(20px)'
    },
    unauthorized: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      margin: '50px auto',
      maxWidth: '500px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)'
    },
    retryButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginTop: '15px',
      transition: 'all 0.3s ease'
    },
    systemStatus: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    statusItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    statusLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#d1d5db'
    },
    statusValue: {
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statusOnline: {
      color: '#22c55e'
    },
    statusOffline: {
      color: '#6b7280'
    }
  };

  // Check authorization after hooks are called
  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div style={styles.container}>
        {/* Background Code Symbols - identical to Dashboard */}
        <div style={styles.backgroundSymbols}>
          <div style={{
            ...styles.codeSymbol,
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
        </div>

        <div style={styles.unauthorized}>
          <h2>Unauthorized Access</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        {/* Background Code Symbols - identical to Dashboard */}
        <div style={styles.backgroundSymbols}>
          <div style={{
            ...styles.codeSymbol,
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            ...styles.codeSymbol,
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
        </div>

        <div style={styles.loading}>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Code Symbols - identical to Dashboard */}
      <div style={styles.backgroundSymbols}>
        <div style={{
          ...styles.codeSymbol,
          left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
        }}>&#60;/&#62;</div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Shield size={28} style={{ color: '#3b82f6' }} />
          Admin Dashboard
        </h1>
        <p style={styles.subtitle}>
          Welcome back, {user?.full_name || user?.username}! Here's what's happening on your platform.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          {error}
          <br />
          <button 
            style={styles.retryButton}
            onClick={fetchDashboardData}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || '0'}
            icon={<Users size={20} />}
            color="#22c55e"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects?.toLocaleString() || '0'}
            icon={<Folder size={20} />}
            color="#3b82f6"
          />
          <StatCard
            title="Total Challenges"
            value={stats.totalChallenges?.toLocaleString() || '0'}
            icon={<Puzzle size={20} />}
            color="#06b6d4"
          />
          <StatCard
            title="New Users (30d)"
            value={stats.recentRegistrations?.toLocaleString() || '0'}
            icon={<UserPlus size={20} />}
            color="#f59e0b"
          />
          <StatCard
            title="Suspended Users"
            value={stats.suspendedUsers?.toLocaleString() || '0'}
            icon={<Users size={20} />}
            color="#ef4444"
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects?.toLocaleString() || '0'}
            icon={<BarChart3 size={20} />}
            color="#8b5cf6"
          />
        </div>
      )}

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActions}>
            <button 
              style={styles.actionButton}
              onClick={() => navigate('/admin/users')}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Users size={16} />
              Manage Users
            </button>
            <button 
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Folder size={16} />
              Manage Projects
            </button>
            <button 
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Puzzle size={16} />
              Manage Challenges
            </button>
            <button 
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Settings size={16} />
              System Settings
            </button>
            <button 
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <BarChart3 size={16} />
              View Reports
            </button>
            <button 
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FileText size={16} />
              Activity Logs
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
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
              No recent admin activity
            </p>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>System Status</h2>
          <div style={styles.systemStatus}>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>System Status:</span>
              <span style={{...styles.statusValue, ...styles.statusOnline}}>
                🟢 Online
              </span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Database:</span>
              <span style={{...styles.statusValue, ...styles.statusOnline}}>
                🟢 Connected
              </span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>User Registration:</span>
              <span style={{...styles.statusValue, ...styles.statusOnline}}>
                🟢 Enabled
              </span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Maintenance Mode:</span>
              <span style={{...styles.statusValue, ...styles.statusOffline}}>
                ⚫ Disabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;