// frontend/src/pages/soloproject/SoloProjectGoals.js - COMPLETE WITH FIXED PROGRESS TRACKING
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SoloProjectService from '../../services/soloProjectService';

function SoloProjectGoals() {
  const { projectId } = useParams();
  const location = useLocation();

  // Check if we came here with a specific intent (task vs goal)
  const searchParams = new URLSearchParams(location.search);
  const createIntent = searchParams.get('intent'); // 'task' or 'goal'

  const [items, setItems] = useState([]); // Renamed from 'goals' to 'items'
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'goals'
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    category: 'feature',
    type: createIntent || 'goal', // Default to goal, but can be task
    estimated_hours: '',
    task_type: 'development'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  // FIXED: Enhanced data fetching with proper progress tracking
  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await SoloProjectService.getGoals(projectId, {
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        const apiItems = res?.data?.goals || [];
        
        // Enhance items with UI-only properties and proper progress tracking
        const enhancedItems = apiItems.map(item => {
          // Calculate progress based on status if not explicitly set
          let progress = item.progress || 0;
          if (!item.progress) {
            if (item.status === 'completed') {
              progress = 100;
            } else if (item.status === 'in_progress') {
              progress = 50; // Default for in-progress items
            } else {
              progress = 0;
            }
          }

          return {
            ...item,
            progress: progress,
            type: item.estimated_hours ? 'task' : 'goal' // Infer type based on data
          };
        });
        
        if (isMounted) setItems(enhancedItems);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load items');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [projectId]);

  // Auto-open create modal if came with intent
  useEffect(() => {
    if (createIntent && !showCreateModal) {
      setShowCreateModal(true);
      setNewItem(prev => ({ ...prev, type: createIntent }));
    }
  }, [createIntent, showCreateModal]);

  // Create item via API
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    try {
      const payload = {
        title: newItem.title,
        description: newItem.description,
        target_date: newItem.target_date || null,
        priority: newItem.priority,
        category: newItem.category,
        // Add task-specific fields if it's a task
        ...(newItem.type === 'task' && {
          estimated_hours: parseInt(newItem.estimated_hours) || null
        })
      };

      const res = await SoloProjectService.createGoal(projectId, payload);
      const createdItem = res?.data?.goal;
      
      if (createdItem) {
        const enhancedItem = {
          ...createdItem,
          progress: 0,
          type: newItem.type
        };
        setItems(prev => [enhancedItem, ...prev]);
      }

      // Reset form
      setNewItem({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        category: 'feature',
        type: 'goal',
        estimated_hours: '',
        task_type: 'development'
      });
      setShowCreateModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create item');
    }
  };

  // FIXED: Enhanced progress tracking that prevents resets
  const updateItemProgress = async (itemId, newProgress) => {
    // Store original item for rollback if needed
    const originalItem = items.find(item => item.id === itemId);
    
    // Update progress optimistically in UI
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          progress: newProgress,
          // Also update status based on progress
          status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'active'
        };
      }
      return item;
    }));

    // Determine the appropriate status based on progress
    let newStatus = 'active';
    if (newProgress >= 100) {
      newStatus = 'completed';
    } else if (newProgress > 0) {
      newStatus = 'in_progress';
    }

    try {
      // Send both progress and status to the backend
      const updateData = { 
        status: newStatus,
        // If your backend supports progress field, include it
        progress: newProgress 
      };

      const res = await SoloProjectService.updateGoal(projectId, itemId, updateData);
      const updatedItem = res?.data?.goal;
      
      if (updatedItem) {
        // Merge the response but preserve our progress value
        setItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item, 
            ...updatedItem, 
            progress: newProgress, // Force our progress value
            type: item.type // Preserve the type
          } : item
        ));
      }
    } catch (err) {
      console.error('Progress update failed:', err);
      
      // Rollback to original state if API call fails
      if (originalItem) {
        setItems(prev => prev.map(item => 
          item.id === itemId ? originalItem : item
        ));
      }
      
      alert(err?.response?.data?.message || 'Failed to update progress');
    }
  };

  // Delete item via API
  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await SoloProjectService.deleteGoal(projectId, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete item');
    }
  };

  // Edit item
  const startEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description || '',
      target_date: item.target_date ? item.target_date.split('T')[0] : '',
      priority: item.priority,
      category: item.category,
      type: item.type || 'goal',
      estimated_hours: item.estimated_hours || '',
      task_type: item.task_type || 'development'
    });
    setShowCreateModal(true);
  };

  // Update existing item
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem || !newItem.title.trim()) return;

    try {
      const payload = {
        title: newItem.title,
        description: newItem.description,
        target_date: newItem.target_date || null,
        priority: newItem.priority,
        category: newItem.category,
        ...(newItem.type === 'task' && {
          estimated_hours: parseInt(newItem.estimated_hours) || null
        })
      };

      const res = await SoloProjectService.updateGoal(projectId, editingItem.id, payload);
      const updatedItem = res?.data?.goal;
      
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...updatedItem, type: newItem.type } : item
        ));
      }

      setEditingItem(null);
      setNewItem({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        category: 'feature',
        type: 'goal',
        estimated_hours: '',
        task_type: 'development'
      });
      setShowCreateModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update item');
    }
  };

  // Filter items based on active tab and view mode
  const filteredItems = items.filter(item => {
    // First filter by view mode
    if (viewMode === 'goals' && item.type !== 'goal') return false;
    
    // Then filter by tab
    switch (activeTab) {
      case 'active':
        return ['active', 'in_progress'].includes(item.status);
      case 'completed':
        return item.status === 'completed';
      case 'tasks':
        return item.type === 'task';
      case 'goals':
        return item.type === 'goal';
      case 'overdue':
        return item.target_date && new Date(item.target_date) < new Date() && item.status !== 'completed';
      default:
        return true;
    }
  });

  // Helper functions
  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#007bff';
      case 'in_progress': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'paused': return '#ffc107';
      case 'blocked': return '#dc3545';
      default: return '#6c757d';
    }
  };

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

  const getItemStats = () => {
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const active = items.filter(i => ['active', 'in_progress'].includes(i.status)).length;
    const tasks = items.filter(i => i.type === 'task').length;
    const goals = items.filter(i => i.type === 'goal').length;
    const overdue = items.filter(i =>
      i.target_date &&
      new Date(i.target_date) < new Date() &&
      i.status !== 'completed'
    ).length;

    return { total, completed, active, tasks, goals, overdue };
  };

  const itemStats = getItemStats();

  // Kanban View Component
  const KanbanView = () => {
    const todoItems = filteredItems.filter(i => ['active', 'todo'].includes(i.status));
    const inProgressItems = filteredItems.filter(i => i.status === 'in_progress');
    const completedItems = filteredItems.filter(i => i.status === 'completed');
    const blockedItems = filteredItems.filter(i => i.status === 'blocked');

    const KanbanColumn = ({ title, items: columnItems }) => (
      <div style={styles.kanbanColumn}>
        <div style={styles.kanbanHeader}>
          <h3 style={styles.kanbanTitle}>{title}</h3>
          <span style={styles.kanbanCount}>{columnItems.length}</span>
        </div>
        <div style={styles.kanbanItems}>
          {columnItems.map(item => (
            <ItemCard key={item.id} item={item} isKanban={true} />
          ))}
        </div>
      </div>
    );

    return (
      <div style={styles.kanbanBoard}>
        <KanbanColumn title="To Do" items={todoItems} />
        <KanbanColumn title="In Progress" items={inProgressItems} />
        <KanbanColumn title="Completed" items={completedItems} />
        {blockedItems.length > 0 && (
          <KanbanColumn title="Blocked" items={blockedItems} />
        )}
      </div>
    );
  };

  // Item Card Component
  const ItemCard = ({ item, isKanban = false }) => (
    <div style={{
      ...styles.itemCard,
      ...(isKanban ? styles.kanbanCard : {})
    }}>
      <div style={styles.itemHeader}>
        <div style={styles.itemTypeIndicator}>
          <span style={styles.itemTypeIcon}>
            {item.type === 'goal' ? '🎯' : '📋'}
          </span>
          <span style={styles.itemTypeText}>{item.type}</span>
        </div>
        <div style={{
          ...styles.priorityBadge,
          backgroundColor: getPriorityColor(item.priority)
        }}>
          {item.priority}
        </div>
      </div>

      <h3 style={styles.itemTitle}>{item.title}</h3>
      
      {item.description && (
        <p style={styles.itemDescription}>
          {item.description.length > 100 ? 
            item.description.substring(0, 100) + '...' : 
            item.description
          }
        </p>
      )}

      {/* FIXED: Enhanced Progress Bar for Goals */}
      {item.type === 'goal' && (
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${item.progress || 0}%`
              }}
            />
          </div>
          <div style={styles.progressControls}>
            <input
              type="range"
              min="0"
              max="100"
              step="5" // Changed to 5% increments for smoother control
              value={item.progress || 0}
              onChange={(e) => {
                const newProgress = parseInt(e.target.value);
                // Immediate UI feedback
                setItems(prev => prev.map(i => 
                  i.id === item.id ? { ...i, progress: newProgress } : i
                ));
              }}
              onMouseUp={(e) => {
                // Only call API when user releases the slider
                const newProgress = parseInt(e.target.value);
                updateItemProgress(item.id, newProgress);
              }}
              onTouchEnd={(e) => {
                // Handle touch devices
                const newProgress = parseInt(e.target.value);
                updateItemProgress(item.id, newProgress);
              }}
              style={styles.progressSlider}
            />
            <span style={styles.progressText}>{item.progress || 0}%</span>
          </div>
          
          {/* Quick progress buttons */}
          <div style={styles.quickProgress}>
            <button 
              style={{
                ...styles.progressButton,
                ...(item.progress === 0 ? styles.progressButtonActive : {})
              }}
              onClick={() => updateItemProgress(item.id, 0)}
            >
              0%
            </button>
            <button 
              style={{
                ...styles.progressButton,
                ...(item.progress === 25 ? styles.progressButtonActive : {})
              }}
              onClick={() => updateItemProgress(item.id, 25)}
            >
              25%
            </button>
            <button 
              style={{
                ...styles.progressButton,
                ...(item.progress === 50 ? styles.progressButtonActive : {})
              }}
              onClick={() => updateItemProgress(item.id, 50)}
            >
              50%
            </button>
            <button 
              style={{
                ...styles.progressButton,
                ...(item.progress === 75 ? styles.progressButtonActive : {})
              }}
              onClick={() => updateItemProgress(item.id, 75)}
            >
              75%
            </button>
            <button 
              style={{
                ...styles.progressButton,
                ...(item.progress === 100 ? styles.progressButtonActive : {})
              }}
              onClick={() => updateItemProgress(item.id, 100)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div style={styles.itemMeta}>
        <div style={styles.itemDetails}>
          <span style={styles.itemMetaItem}>
            📅 {formatDate(item.target_date)}
          </span>
          {item.estimated_hours && (
            <span style={styles.itemMetaItem}>
              ⏱️ {item.estimated_hours}h
            </span>
          )}
        </div>
        
        <div style={styles.itemCategory}>
          {getCategoryIcon(item.category)} {item.category}
        </div>
      </div>

      <div style={styles.itemFooter}>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: getStatusColor(item.status)
        }}>
          {item.status.replace('_', ' ')}
        </span>
        
        <div style={styles.itemActions}>
          <button 
            style={styles.editButton}
            onClick={() => startEditItem(item)}
          >
            Edit
          </button>
          <button 
            style={styles.deleteButton}
            onClick={() => deleteItem(item.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <h2>Loading tasks & goals...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>Tasks & Goals</h1>
          <button 
            style={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            + Add Item
          </button>
        </div>

        {/* View Mode Toggle */}
        <div style={styles.viewToggle}>
          <button 
            style={{
              ...styles.viewButton,
              ...(viewMode === 'list' ? styles.viewButtonActive : {})
            }}
            onClick={() => setViewMode('list')}
          >
            📝 List
          </button>
          <button 
            style={{
              ...styles.viewButton,
              ...(viewMode === 'kanban' ? styles.viewButtonActive : {})
            }}
            onClick={() => setViewMode('kanban')}
          >
            📋 Kanban
          </button>
          <button 
            style={{
              ...styles.viewButton,
              ...(viewMode === 'goals' ? styles.viewButtonActive : {})
            }}
            onClick={() => setViewMode('goals')}
          >
            🎯 Goals Focus
          </button>
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>📋 {itemStats.tasks} Tasks</div>
          <div style={styles.statItem}>🎯 {itemStats.goals} Goals</div>
          <div style={styles.statItem}>✅ {itemStats.completed} Completed</div>
          <div style={styles.statItem}>🔄 {itemStats.active} Active</div>
          {itemStats.overdue > 0 && (
            <div style={{...styles.statItem, color: '#dc3545'}}>
              ⚠️ {itemStats.overdue} Overdue
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All Items', count: itemStats.total },
          { key: 'active', label: 'Active', count: itemStats.active },
          { key: 'completed', label: 'Completed', count: itemStats.completed },
          { key: 'tasks', label: 'Tasks Only', count: itemStats.tasks },
          { key: 'goals', label: 'Goals Only', count: itemStats.goals },
          ...(itemStats.overdue > 0 ? [{ key: 'overdue', label: 'Overdue', count: itemStats.overdue }] : [])
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.filterTab,
              ...(activeTab === tab.key ? styles.filterTabActive : {})
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {viewMode === 'kanban' ? (
          <KanbanView />
        ) : (
          <div style={styles.itemGrid}>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>
                  {activeTab === 'tasks' ? '📋' : activeTab === 'goals' ? '🎯' : '✅'}
                </div>
                <div style={styles.emptyStateText}>
                  No {activeTab === 'all' ? 'items' : activeTab} found
                </div>
                <button 
                  style={styles.emptyStateButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create your first {activeTab === 'tasks' ? 'task' : activeTab === 'goals' ? 'goal' : 'item'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => {
          setShowCreateModal(false);
          setEditingItem(null);
          setNewItem({
            title: '',
            description: '',
            target_date: '',
            priority: 'medium',
            category: 'feature',
            type: 'goal',
            estimated_hours: '',
            task_type: 'development'
          });
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Create'} {newItem.type === 'task' ? 'Task' : 'Goal'}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>

            {/* Body with scrollable content */}
            <div style={styles.modalBody}>
              {/* Type Toggle */}
              <div style={styles.typeToggle}>
                <button
                  type="button"
                  style={{
                    ...styles.typeButton,
                    ...(newItem.type === 'task' ? styles.typeButtonActive : {})
                  }}
                  onClick={() => setNewItem({...newItem, type: 'task'})}
                  onMouseEnter={(e) => {
                    if (newItem.type !== 'task') {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newItem.type !== 'task') {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  📋 Task
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.typeButton,
                    ...(newItem.type === 'goal' ? styles.typeButtonActive : {})
                  }}
                  onClick={() => setNewItem({...newItem, type: 'goal'})}
                  onMouseEnter={(e) => {
                    if (newItem.type !== 'goal') {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newItem.type !== 'goal') {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  🎯 Goal
                </button>
              </div>

              {/* Form Container */}
              <div style={styles.formContainer}>
                <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem}>
                  {/* Title Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Title *</label>
                    <input
                      style={styles.formInput}
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder={`Enter ${newItem.type} title`}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Description Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Description</label>
                    <textarea
                      style={styles.formTextarea}
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder={`Describe your ${newItem.type}...`}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Priority and Category Row */}
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Priority</label>
                      <select
                        style={styles.formInput}
                        value={newItem.priority}
                        onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Category</label>
                      <select
                        style={styles.formInput}
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
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

                  {/* Task-specific Fields */}
                  {newItem.type === 'task' && (
                    <div style={styles.taskSpecificFields}>
                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.formLabel}>Task Type</label>
                          <select
                            style={styles.formInput}
                            value={newItem.task_type}
                            onChange={(e) => setNewItem({ ...newItem, task_type: e.target.value })}
                          >
                            <option value="development">Development</option>
                            <option value="design">Design</option>
                            <option value="research">Research</option>
                            <option value="planning">Planning</option>
                            <option value="testing">Testing</option>
                            <option value="documentation">Documentation</option>
                          </select>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.formLabel}>Estimated Hours</label>
                          <input
                            style={styles.formInput}
                            type="number"
                            value={newItem.estimated_hours}
                            onChange={(e) => setNewItem({ ...newItem, estimated_hours: e.target.value })}
                            placeholder="0"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Goal-specific Fields */}
                  {newItem.type === 'goal' && (
                    <div style={styles.goalSpecificFields}>
                      <p style={styles.goalNote}>
                        🎯 Goals are tracked with progress updates and focus on long-term objectives
                      </p>
                    </div>
                  )}

                  {/* Target Date */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      {newItem.type === 'task' ? 'Due Date' : 'Target Date'}
                    </label>
                    <input
                      style={styles.formInput}
                      type="date"
                      value={newItem.target_date}
                      onChange={(e) => setNewItem({ ...newItem, target_date: e.target.value })}
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                }}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.cancelButtonHover)}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(newItem.title.trim() ? {} : styles.submitButtonDisabled)
                }}
                onClick={editingItem ? handleUpdateItem : handleCreateItem}
                disabled={!newItem.title.trim()}
                onMouseEnter={(e) => {
                  if (newItem.title.trim()) {
                    Object.assign(e.target.style, styles.submitButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (newItem.title.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1)';
                  }
                }}
              >
                {editingItem ? 'Update' : 'Create'} {newItem.type === 'task' ? 'Task' : 'Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPLETE STYLES WITH FIXED PROGRESS TRACKING
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '32px'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0
  },
  createButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  viewToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  viewButton: {
    backgroundColor: 'white',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  viewButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  statItem: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterTab: {
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  content: {
    marginBottom: '24px'
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  itemCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  kanbanBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    minHeight: '500px'
  },
  kanbanColumn: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px'
  },
  kanbanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  kanbanTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0
  },
  kanbanCount: {
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  kanbanItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  kanbanCard: {
    margin: 0
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  itemTypeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  itemTypeIcon: {
    fontSize: '16px'
  },
  itemTypeText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  priorityBadge: {
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  itemTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 12px 0'
  },
  itemDescription: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 16px 0',
    lineHeight: '1.5'
  },
  progressSection: {
    marginBottom: '16px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  progressControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  progressSlider: {
    flex: 1,
    height: '6px',
    appearance: 'none',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer'
  },
  progressText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    minWidth: '40px'
  },
  // NEW: Quick progress buttons styles
  quickProgress: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  progressButton: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  progressButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  itemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  itemMetaItem: {
    fontSize: '12px',
    color: '#64748b'
  },
  itemCategory: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9'
  },
  statusBadge: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  itemActions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#64748b',
    gridColumn: '1 / -1'
  },
  emptyStateIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyStateText: {
    fontSize: '18px',
    marginBottom: '16px'
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  loadingState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#64748b'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  
  // MODAL STYLES
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '32px 32px 24px 32px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafafa'
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px'
  },
  modalBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '0'
  },
  typeToggle: {
    display: 'flex',
    gap: '12px',
    margin: '24px 32px',
    padding: '6px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
  },
  typeButton: {
    flex: 1,
    backgroundColor: 'white',
    color: '#64748b',
    border: '2px solid transparent',
    padding: '16px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
  },
  formContainer: {
    padding: '0 32px 24px 32px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px'
  },
  formLabel: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  formTextarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  taskSpecificFields: {
    backgroundColor: '#f0f9ff',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px solid #e0f2fe'
  },
  goalSpecificFields: {
    backgroundColor: '#f0fdf4',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px solid #dcfce7'
  },
  goalNote: {
    fontSize: '15px',
    color: '#059669',
    margin: 0,
    fontStyle: 'italic',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    padding: '24px 32px 32px 32px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#fafafa'
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  cancelButtonHover: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: '2px solid #3b82f6',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '160px',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
  },
  submitButtonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 15px -3px rgba(59, 130, 246, 0.2)'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  }
};

export default SoloProjectGoals;