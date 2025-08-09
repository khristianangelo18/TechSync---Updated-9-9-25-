// frontend/src/pages/project/ProjectTasks.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';

function ProjectTasks() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Form state for creating/editing tasks
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: 'development',
    priority: 'medium',
    status: 'todo',
    assigned_to: '',
    estimated_hours: '',
    due_date: ''
  });

  // Fetch project details and members
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectResponse, membersResponse] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getProjectMembers ? projectService.getProjectMembers(projectId) : Promise.resolve({ data: { members: [] } })
        ]);
        
        setProject(projectResponse.data.project);
        setProjectMembers(membersResponse.data.members || []);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load project information');
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Fetch tasks function with useCallback to prevent infinite re-renders
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getProjectTasks(projectId, {
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, sortBy, sortOrder]);

  // Fetch tasks when dependencies change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create new task
  const createTask = async () => {
    try {
      const taskData = {
        ...taskForm,
        estimated_hours: taskForm.estimated_hours ? parseInt(taskForm.estimated_hours) : null,
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to || null
      };

      const response = await taskService.createTask(projectId, taskData);
      
      if (response.success) {
        setTasks(prev => [response.data.task, ...prev]);
        resetForm();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await taskService.updateTask(projectId, taskId, updates);
      
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...response.data.task } : task
        ));
        
        if (editingTask) {
          setEditingTask(null);
          resetForm();
          setShowCreateModal(false);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(projectId, taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  // Form handlers
  const handleFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      task_type: 'development',
      priority: 'medium',
      status: 'todo',
      assigned_to: '',
      estimated_hours: '',
      due_date: ''
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      task_type: task.task_type || 'development',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'my_tasks') return task.assigned_to === user?.id;
    return task.status === filter;
  });

  // Check permissions
  const canCreateTasks = project?.owner_id === user?.id || 
    projectMembers.some(member => member.user_id === user?.id);

  const canEditTask = (task) => {
    return project?.owner_id === user?.id || 
           task.created_by === user?.id || 
           task.assigned_to === user?.id;
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
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
    headerLeft: {
      flex: 1
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
    headerRight: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    createButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    controls: {
      display: 'flex',
      gap: '15px',
      marginBottom: '25px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    sortControls: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    tasksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    taskCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    taskCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    taskHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    taskTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      margin: '0 0 8px 0',
      flex: 1
    },
    taskMeta: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '12px'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    statusBadge: {
      backgroundColor: '#e3f2fd',
      color: '#1565c0'
    },
    priorityBadge: {
      backgroundColor: '#fff3e0',
      color: '#ef6c00'
    },
    typeBadge: {
      backgroundColor: '#f3e5f5',
      color: '#7b1fa2'
    },
    taskDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '15px'
    },
    taskFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#888'
    },
    taskActions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '5px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '12px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '30px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#666'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    formActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '25px'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6c757d'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6c757d'
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      'todo': { bg: '#e3f2fd', color: '#1565c0' },
      'in_progress': { bg: '#fff3e0', color: '#ef6c00' },
      'in_review': { bg: '#f3e5f5', color: '#7b1fa2' },
      'completed': { bg: '#e8f5e8', color: '#2e7d32' },
      'blocked': { bg: '#ffebee', color: '#c62828' }
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: '#e8f5e8', color: '#2e7d32' },
      'medium': { bg: '#fff3e0', color: '#ef6c00' },
      'high': { bg: '#ffebee', color: '#c62828' },
      'urgent': { bg: '#f3e5f5', color: '#7b1fa2' }
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  const getMemberName = (userId) => {
    const member = projectMembers.find(m => m.user_id === userId);
    return member ? `${member.first_name} ${member.last_name}` : 'Unassigned';
  };

  if (loading && tasks.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <h3>Loading tasks...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Tasks</h1>
          <p style={styles.subtitle}>
            Project task management and tracking • {filteredTasks.length} tasks
          </p>
        </div>
        <div style={styles.headerRight}>
          {canCreateTasks && (
            <button
              style={styles.createButton}
              onClick={() => {
                resetForm();
                setEditingTask(null);
                setShowCreateModal(true);
              }}
            >
              + Create Task
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <select
          style={styles.filterSelect}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Tasks</option>
          <option value="my_tasks">My Tasks</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>

        <div style={styles.sortControls}>
          <select
            style={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Date Created</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
          
          <button
            style={styles.actionButton}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No tasks found</h3>
          <p>
            {filter === 'all' 
              ? 'No tasks have been created yet.' 
              : `No tasks match the current filter: ${filter}`
            }
          </p>
          {canCreateTasks && filter === 'all' && (
            <button
              style={styles.createButton}
              onClick={() => {
                resetForm();
                setEditingTask(null);
                setShowCreateModal(true);
              }}
            >
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div style={styles.tasksGrid}>
          {filteredTasks.map(task => {
            const statusColor = getStatusColor(task.status);
            const priorityColor = getPriorityColor(task.priority);
            
            return (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskHeader}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                </div>
                
                <div style={styles.taskMeta}>
                  <span 
                    style={{
                      ...styles.badge,
                      ...styles.statusBadge,
                      backgroundColor: statusColor.bg,
                      color: statusColor.color
                    }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span 
                    style={{
                      ...styles.badge,
                      ...styles.priorityBadge,
                      backgroundColor: priorityColor.bg,
                      color: priorityColor.color
                    }}
                  >
                    {task.priority}
                  </span>
                  <span style={{...styles.badge, ...styles.typeBadge}}>
                    {task.task_type}
                  </span>
                </div>

                {task.description && (
                  <p style={styles.taskDescription}>{task.description}</p>
                )}

                <div style={styles.taskFooter}>
                  <div>
                    <div>Assigned: {getMemberName(task.assigned_to)}</div>
                    <div>Due: {formatDate(task.due_date)}</div>
                    {task.estimated_hours && (
                      <div>Est: {task.estimated_hours}h</div>
                    )}
                  </div>
                  
                  {canEditTask(task) && (
                    <div style={styles.taskActions}>
                      <button
                        style={styles.actionButton}
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>
                      {(project?.owner_id === user?.id || task.created_by === user?.id) && (
                        <button
                          style={{...styles.actionButton, color: '#dc3545'}}
                          onClick={() => deleteTask(task.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCreateModal(false);
            setEditingTask(null);
            resetForm();
          }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTask(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingTask) {
                updateTask(editingTask.id, taskForm);
              } else {
                createTask();
              }
            }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={taskForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={taskForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe the task..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Type</label>
                  <select
                    style={styles.select}
                    value={taskForm.task_type}
                    onChange={(e) => handleFormChange('task_type', e.target.value)}
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="documentation">Documentation</option>
                    <option value="research">Research</option>
                    <option value="meeting">Meeting</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.select}
                    value={taskForm.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    value={taskForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select
                    style={styles.select}
                    value={taskForm.assigned_to}
                    onChange={(e) => handleFormChange('assigned_to', e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estimated Hours</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={taskForm.estimated_hours}
                    onChange={(e) => handleFormChange('estimated_hours', e.target.value)}
                    min="0"
                    step="0.5"
                    placeholder="e.g., 8"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={taskForm.due_date}
                    onChange={(e) => handleFormChange('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTasks;