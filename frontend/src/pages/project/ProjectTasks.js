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
  // const [projectMembers, setProjectMembers] = useState([]); // TODO: Add when member management is implemented
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

  // Fetch project details only (remove members for now)
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await projectService.getProjectById(projectId);
        setProject(projectResponse.data.project);
        
        // For now, just set empty members array - we'll add this functionality later
        // setProjectMembers([]);
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
      setError(null); // Clear any previous errors
      
      const response = await taskService.getProjectTasks(projectId, {
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      setTasks(response.data.tasks || []);
      console.log('✅ Tasks loaded successfully:', response.data.tasks?.length || 0, 'tasks');
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
    console.log('🚀 Creating task with form data:', taskForm);
    
    // Prepare task data with proper validation handling
    const taskData = {
      title: taskForm.title.trim(), // Required field
      description: taskForm.description.trim() || undefined, // Send undefined instead of empty string
      task_type: taskForm.task_type || 'development',
      priority: taskForm.priority || 'medium',
      status: taskForm.status || 'todo',
      // Handle assigned_to - send undefined instead of empty string for UUID validation
      assigned_to: taskForm.assigned_to && taskForm.assigned_to.trim() ? taskForm.assigned_to.trim() : undefined,
      // Handle estimated_hours - convert to integer or send undefined
      estimated_hours: taskForm.estimated_hours && taskForm.estimated_hours.trim() ? parseInt(taskForm.estimated_hours) : undefined,
      // Handle due_date - ensure proper ISO format or send undefined
      due_date: taskForm.due_date && taskForm.due_date.trim() ? new Date(taskForm.due_date).toISOString() : undefined
    };
    
    // Remove any undefined values (backend validation prefers this)
    Object.keys(taskData).forEach(key => {
      if (taskData[key] === undefined) {
        delete taskData[key];
      }
    });
    
    console.log('📝 Cleaned task data being sent:', taskData);
    console.log('🎯 Project ID:', projectId);
    
    const response = await taskService.createTask(projectId, taskData);
    
    console.log('✅ Task creation response:', response);
    
    if (response.success) {
      // Add the new task to the beginning of the list
      setTasks(prev => [response.data.task, ...prev]);
      setShowCreateModal(false);
      resetForm();
      setError(null); // Clear any previous errors
    }
    
  } catch (error) {
    console.error('❌ Task creation failed:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    
    if (error.response?.data?.message) {
      setError(`Failed to create task: ${error.response.data.message}`);
    } else if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map(e => e.msg || e.message).join(', ');
      setError(`Validation errors: ${errorMessages}`);
    } else {
      setError('Failed to create task. Please check the console for details.');
    }
  }
};

  // Update task
  const updateTask = async (taskId, updateData) => {
    try {
      await taskService.updateTask(projectId, taskId, updateData);
      await fetchTasks(); // Refresh tasks list
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
      await fetchTasks(); // Refresh tasks list
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  // Reset form
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

  // Edit task
  const editTask = (task) => {
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      task_type: task.task_type || 'development',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours ? task.estimated_hours.toString() : '',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setEditingTask(task);
    setShowCreateModal(true);
  };

  // Save task (create or update)
  const saveTask = async () => {
    if (editingTask) {
      await updateTask(editingTask.id, taskForm);
      setEditingTask(null);
    } else {
      await createTask();
    }
  };

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'my_tasks':
        return task.assigned_to === user.id;
      case 'todo':
        return task.status === 'todo';
      case 'in_progress':
        return task.status === 'in_progress';
      case 'in_review':
        return task.status === 'in_review';
      case 'completed':
        return task.status === 'completed';
      case 'blocked':
        return task.status === 'blocked';
      default:
        return true;
    }
  });

  // Check if user can create tasks (project owner or member)
  const canCreateTasks = project && (project.owner_id === user.id);

  // Component styles
  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    headerLeft: {
      flex: 1
    },
    headerRight: {
      display: 'flex',
      gap: '10px'
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
    createButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    controls: {
      display: 'flex',
      gap: '15px',
      marginBottom: '30px',
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
    actionButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    tasksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    taskCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    taskHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '15px'
    },
    taskTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      margin: '0 0 8px 0',
      flex: 1
    },
    taskMeta: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
      flexWrap: 'wrap'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    taskDescription: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '15px',
      lineHeight: '1.4'
    },
    taskFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    },
    taskActions: {
      display: 'flex',
      gap: '8px'
    },
    taskButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
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
    },
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '600',
      margin: '0 0 10px 0'
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
      minHeight: '100px',
      resize: 'vertical'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    primaryButton: {
      backgroundColor: '#28a745',
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
    // For now, just return 'Assigned' since we don't have member data
    // TODO: Implement proper member lookup when member management is added
    return userId ? 'Assigned' : 'Unassigned';
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
              : `No tasks match the "${filter}" filter.`
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
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <div style={styles.tasksGrid}>
          {filteredTasks.map((task) => {
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
                      ...styles.statusBadge,
                      backgroundColor: statusColor.bg,
                      color: statusColor.color
                    }}
                  >
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span 
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: priorityColor.bg,
                      color: priorityColor.color
                    }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {task.description && (
                  <p style={styles.taskDescription}>
                    {task.description.length > 150 
                      ? task.description.substring(0, 150) + '...'
                      : task.description
                    }
                  </p>
                )}

                <div style={styles.taskFooter}>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <div>Due: {formatDate(task.due_date)}</div>
                    <div>Assigned: {getMemberName(task.assigned_to)}</div>
                  </div>
                  
                  {canCreateTasks && (
                    <div style={styles.taskActions}>
                      <button
                        style={styles.taskButton}
                        onClick={() => editTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
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
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                style={styles.input}
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select
                style={styles.select}
                value={taskForm.task_type}
                onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
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
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                style={styles.select}
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Estimated Hours</label>
              <input
                type="number"
                style={styles.input}
                value={taskForm.estimated_hours}
                onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                placeholder="Enter estimated hours"
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                style={styles.input}
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.secondaryButton}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.primaryButton}
                onClick={saveTask}
                disabled={!taskForm.title.trim()}
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTasks;