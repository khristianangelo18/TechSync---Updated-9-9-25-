// frontend/src/pages/soloproject/SoloProjectGoals.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SoloProjectService from '../../services/soloProjectService';

function SoloProjectGoals() {
  const { projectId } = useParams();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [error, setError] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    category: 'feature'
  });
  const [activeTab, setActiveTab] = useState('all');

  // Fetch goals from API
  useEffect(() => {
    let isMounted = true;

    const fetchGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await SoloProjectService.getGoals(projectId, {
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        const apiGoals = res?.data?.goals || [];
        // Attach a UI-only progress value: 100 if completed, else 0
        const withProgress = apiGoals.map(g => ({
          ...g,
          progress: g.status === 'completed' ? 100 : 0
        }));
        if (isMounted) setGoals(withProgress);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load goals');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGoals();
    return () => { isMounted = false; };
  }, [projectId]);

  // Create goal via API
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    // Validate before sending (optional)
    const { isValid, errors } = SoloProjectService.validateGoalData(newGoal);
    if (!isValid) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const payload = {
        title: newGoal.title,
        description: newGoal.description,
        target_date: newGoal.target_date || null,
        priority: newGoal.priority,
        category: newGoal.category
      };
      const res = await SoloProjectService.createGoal(projectId, payload);
      const createdGoal = res?.data?.goal;
      if (createdGoal) {
        // Add UI-only progress
        setGoals(prev => [{ ...createdGoal, progress: 0 }, ...prev]);
      }
      setNewGoal({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        category: 'feature'
      });
      setShowCreateGoal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create goal');
    }
  };

  // Update progress locally and persist status via API
  const updateGoalProgress = async (goalId, newProgress) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, progress: newProgress };
      }
      return goal;
    }));

    // Map progress to status for persistence
    const newStatus = newProgress >= 100 ? 'completed' : 'active';

    try {
      const res = await SoloProjectService.updateGoal(projectId, goalId, { status: newStatus });
      const updatedGoal = res?.data?.goal;
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updatedGoal } : g));
      }
    } catch (err) {
      // Revert progress if API call fails
      setGoals(prev => prev.map(goal => {
        if (goal.id === goalId) {
          const fallbackProgress = goal.status === 'completed' ? 100 : 0;
          return { ...goal, progress: fallbackProgress };
        }
        return goal;
      }));
      alert(err?.response?.data?.message || 'Failed to update goal');
    }
  };

  // Delete goal via API
  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await SoloProjectService.deleteGoal(projectId, goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete goal');
    }
  };

  // Filter goals based on active tab
  const filteredGoals = goals.filter(goal => {
    switch (activeTab) {
      case 'active':
        return goal.status === 'active';
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
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Align category icons with backend categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'learning': return '📚';
      case 'feature': return '⚡';
      case 'bug_fix': return '🐛';
      case 'optimization': return '⚡';
      case 'documentation': return '📄';
      case 'testing': return '🧪';
      default: return '🎯';
    }
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'active').length;
    const overdue = goals.filter(g =>
      g.target_date &&
      new Date(g.target_date) < new Date() &&
      g.status !== 'completed'
    ).length;

    return { total, completed, active, overdue };
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
    error: {
      backgroundColor: '#fff3f3',
      border: '1px solid #f5c2c7',
      color: '#842029',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px'
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

      {/* Error */}
      {error && <div style={styles.error}>⚠️ {error}</div>}

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
          <div style={styles.statNumber}>{goalStats.active}</div>
          <div style={styles.statLabel}>Active</div>
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
            const progress = typeof goal.progress === 'number' ? goal.progress : (goal.status === 'completed' ? 100 : 0);

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
                    <span style={styles.progressValue}>{progress}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${progress}%`
                      }}
                    />
                  </div>

                  {goal.status !== 'completed' && (
                    <div style={styles.progressControls}>
                      <button
                        style={styles.progressButton}
                        onClick={() => updateGoalProgress(goal.id, Math.max(0, progress - 10))}
                      >
                        -10%
                      </button>
                      <button
                        style={styles.progressButton}
                        onClick={() => updateGoalProgress(goal.id, Math.min(100, progress + 10))}
                      >
                        +10%
                      </button>
                      <button
                        style={styles.progressButton}
                        onClick={() => updateGoalProgress(goal.id, Math.min(100, progress + 25))}
                      >
                        +25%
                      </button>
                      {progress < 100 && (
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
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Category</label>
                  <select
                    style={styles.formInput}
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  >
                    <option value="learning">Learning</option>
                    <option value="feature">Feature</option>
                    <option value="bug_fix">Bug Fix</option>
                    <option value="optimization">Optimization</option>
                    <option value="documentation">Documentation</option>
                    <option value="testing">Testing</option>
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