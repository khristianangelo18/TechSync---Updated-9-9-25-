// frontend/src/pages/soloproject/SoloProjectGoals.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; // Removed unused import

function SoloProjectGoals() {
  const { projectId } = useParams();
  // const { user } = useAuth(); // Removed unused variable
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    category: 'development'
  });
  const [activeTab, setActiveTab] = useState('all');

  // Mock goals data - replace with API calls
  useEffect(() => {
    const mockGoals = [
      {
        id: 1,
        title: 'Complete User Authentication System',
        description: 'Implement login, registration, and password reset functionality with JWT tokens',
        target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        priority: 'high',
        category: 'development',
        status: 'in_progress',
        progress: 65,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: 'Design System Documentation',
        description: 'Create comprehensive style guide and component documentation',
        target_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        priority: 'medium',
        category: 'design',
        status: 'todo',
        progress: 0,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Launch MVP Version',
        description: 'Deploy the minimum viable product to production with core features',
        target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 1.5 months from now
        priority: 'urgent',
        category: 'milestone',
        status: 'todo',
        progress: 25,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        title: 'Performance Optimization',
        description: 'Optimize database queries and implement caching strategies',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
        priority: 'medium',
        category: 'optimization',
        status: 'completed',
        progress: 100,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
    
    setGoals(mockGoals);
    setLoading(false);
  }, [projectId]);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      target_date: newGoal.target_date ? new Date(newGoal.target_date) : null,
      status: 'todo',
      progress: 0,
      created_at: new Date()
    };

    setGoals(prev => [goal, ...prev]);
    setNewGoal({
      title: '',
      description: '',
      target_date: '',
      priority: 'medium',
      category: 'development'
    });
    setShowCreateGoal(false);
  };

  const updateGoalProgress = (goalId, newProgress) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, progress: newProgress };
        if (newProgress === 100 && goal.status !== 'completed') {
          updatedGoal.status = 'completed';
          updatedGoal.completed_at = new Date();
        } else if (newProgress > 0 && newProgress < 100 && goal.status !== 'in_progress') {
          updatedGoal.status = 'in_progress';
        } else if (newProgress === 0 && goal.status !== 'todo') {
          updatedGoal.status = 'todo';
        }
        return updatedGoal;
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    }
  };

  // Filter goals based on active tab
  const filteredGoals = goals.filter(goal => {
    switch (activeTab) {
      case 'active':
        return goal.status === 'in_progress';
      case 'completed':
        return goal.status === 'completed';
      case 'overdue':
        return goal.target_date && new Date(goal.target_date) < new Date() && goal.status !== 'completed';
      default:
        return true;
    }
  });

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilTarget = (targetDate) => {
    if (!targetDate) return null;
    const days = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'development': return '💻';
      case 'design': return '🎨';
      case 'milestone': return '🏁';
      case 'optimization': return '⚡';
      case 'learning': return '📚';
      case 'research': return '🔍';
      default: return '📋';
    }
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const inProgress = goals.filter(g => g.status === 'in_progress').length;
    const overdue = goals.filter(g => 
      g.target_date && 
      new Date(g.target_date) < new Date() && 
      g.status !== 'completed'
    ).length;
    
    return { total, completed, inProgress, overdue };
  };

  const goalStats = getGoalStats();

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      color: '#333',
      fontSize: '28px',
      margin: '0 0 8px 0',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    createButton: {
      backgroundColor: '#6f42c1',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#6f42c1',
      margin: '0 0 8px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6c757d',
      margin: 0,
      fontWeight: '500'
    },
    tabsContainer: {
      display: 'flex',
      gap: '4px',
      marginBottom: '30px',
      borderBottom: '1px solid #e9ecef'
    },
    tab: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#6c757d',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease'
    },
    tabActive: {
      color: '#6f42c1',
      borderBottomColor: '#6f42c1'
    },
    goalsGrid: {
      display: 'grid',
      gap: '20px'
    },
    goalCard: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '24px',
      transition: 'all 0.2s ease'
    },
    goalCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    goalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    goalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 8px 0',
      flex: 1
    },
    goalActions: {
      display: 'flex',
      gap: '8px',
      marginLeft: '16px'
    },
    actionButton: {
      padding: '6px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#6c757d',
      fontSize: '12px',
      cursor: 'pointer'
    },
    goalMeta: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '16px'
    },
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white',
      textTransform: 'capitalize'
    },
    categoryBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#f8f9fa',
      color: '#6c757d'
    },
    targetDate: {
      fontSize: '14px',
      color: '#6c757d'
    },
    overdue: {
      color: '#dc3545',
      fontWeight: '500'
    },
    goalDescription: {
      fontSize: '14px',
      color: '#6c757d',
      lineHeight: '1.5',
      marginBottom: '20px'
    },
    progressSection: {
      marginBottom: '16px'
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    progressLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    progressValue: {
      fontSize: '14px',
      color: '#6f42c1',
      fontWeight: 'bold'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#6f42c1',
      transition: 'width 0.3s ease'
    },
    progressControls: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px'
    },
    progressButton: {
      padding: '6px 12px',
      border: '1px solid #6f42c1',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#6f42c1',
      fontSize: '12px',
      cursor: 'pointer'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    },
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: 0.5
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      width: '100%',
      maxWidth: '500px',
      margin: '20px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 24px 0'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    formLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    formInput: {
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px'
    },
    formTextarea: {
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    cancelButton: {
      padding: '12px 24px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#6c757d',
      fontSize: '14px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#6f42c1',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#6c757d' }}>
          Loading goals...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Goals</h1>
          <p style={styles.subtitle}>Track your project objectives and milestones</p>
        </div>
        <button
          style={styles.createButton}
          onClick={() => setShowCreateGoal(true)}
        >
          + Create Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{goalStats.total}</div>
          <div style={styles.statLabel}>Total Goals</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{goalStats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{goalStats.inProgress}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{goalStats.overdue}</div>
          <div style={styles.statLabel}>Overdue</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {[
          { key: 'all', label: 'All Goals' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
          { key: 'overdue', label: 'Overdue' }
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div style={styles.goalsGrid}>
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const daysUntil = getDaysUntilTarget(goal.target_date);
            const isOverdue = daysUntil !== null && daysUntil < 0 && goal.status !== 'completed';
            
            return (
              <div
                key={goal.id}
                style={styles.goalCard}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.goalCardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.goalHeader}>
                  <h3 style={styles.goalTitle}>{goal.title}</h3>
                  <div style={styles.goalActions}>
                    <button
                      style={{...styles.actionButton, color: '#dc3545'}}
                      onClick={() => deleteGoal(goal.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={styles.goalMeta}>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(goal.priority)
                    }}
                  >
                    {goal.priority} priority
                  </span>
                  
                  <span style={styles.categoryBadge}>
                    {getCategoryIcon(goal.category)} {goal.category}
                  </span>
                  
                  <span style={{
                    ...styles.targetDate,
                    ...(isOverdue ? styles.overdue : {})
                  }}>
                    {goal.target_date ? (
                      isOverdue 
                        ? `Overdue by ${Math.abs(daysUntil)} days`
                        : daysUntil === 0 
                        ? 'Due today'
                        : daysUntil > 0 
                        ? `${daysUntil} days left`
                        : formatDate(goal.target_date)
                    ) : 'No deadline'}
                  </span>
                </div>

                {goal.description && (
                  <p style={styles.goalDescription}>{goal.description}</p>
                )}

                {/* Progress Section */}
                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span style={styles.progressValue}>{goal.progress}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${goal.progress}%`
                      }}
                    />
                  </div>
                  
                  {goal.status !== 'completed' && (
                    <div style={styles.progressControls}>
                      <button
                        style={styles.progressButton}
                        onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                      >
                        -10%
                      </button>
                      <button
                        style={styles.progressButton}
                        onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                      >
                        +10%
                      </button>
                      <button
                        style={styles.progressButton}
                        onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 25))}
                      >
                        +25%
                      </button>
                      {goal.progress < 100 && (
                        <button
                          style={styles.progressButton}
                          onClick={() => updateGoalProgress(goal.id, 100)}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {goal.completed_at && (
                  <div style={{ fontSize: '12px', color: '#28a745', fontWeight: '500' }}>
                    ✅ Completed on {formatDate(goal.completed_at)}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🎯</div>
            <div>No goals found</div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div style={styles.modal} onClick={() => setShowCreateGoal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Goal</h2>
            
            <form style={styles.form} onSubmit={handleCreateGoal}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Goal Title *</label>
                <input
                  style={styles.formInput}
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Enter goal title"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  style={styles.formTextarea}
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal in detail..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Priority</label>
                  <select
                    style={styles.formInput}
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Category</label>
                  <select
                    style={styles.formInput}
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="milestone">Milestone</option>
                    <option value="optimization">Optimization</option>
                    <option value="learning">Learning</option>
                    <option value="research">Research</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Target Date</label>
                <input
                  style={styles.formInput}
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowCreateGoal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={!newGoal.title.trim()}
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SoloProjectGoals;