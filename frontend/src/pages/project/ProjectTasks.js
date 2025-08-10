// frontend/src/pages/project/ProjectTasks.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';

function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
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
        const projectResponse = await projectService.getProjectById(projectId);
        setProject(projectResponse.data.project);
        
        // Try to fetch members, but don't fail if the endpoint doesn't exist
        try {
          const membersResponse = await projectService.getProjectMembers(projectId);
          setProjectMembers(membersResponse.data.members || []);
        } catch (memberError) {
          console.log('Could not fetch project members:', memberError);
          setProjectMembers([]);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load project data');
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
        due_date: taskForm.due_date && taskForm.due_date.trim() ? 
          new Date(taskForm.due_date).toISOString() : undefined
      };

      console.log('📤 Sending task data:', taskData);

      const response = await taskService.createTask(projectId, taskData);
      
      console.log('✅ Task created successfully:', response.data.task);
      
      // Add the new task to the local state
      setTasks(prevTasks => [response.data.task, ...prevTasks]);
      
      // Close modal and reset form
      setShowCreateModal(false);
      resetForm();
      setError(null);
    } catch (error) {
      console.error('💥 Create task error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create task';
      setError(errorMessage);
    }
  };

  // Edit existing task
  const editTask = (task) => {
    console.log('✏️ Editing task:', task);
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      task_type: task.task_type || 'development',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.deleteTask(projectId, taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      console.log('✅ Task deleted successfully');
    } catch (error) {
      console.error('💥 Delete task error:', error);
      setError('Failed to delete task');
    }
  };

  // Navigate to task detail page
  const viewTaskDetail = (taskId) => {
    navigate(`/project/${projectId}/tasks/${taskId}`);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (create or update)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        console.log('📝 Updating task:', editingTask.id);
        
        const taskData = {
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || undefined,
          task_type: taskForm.task_type || 'development',
          priority: taskForm.priority || 'medium',
          status: taskForm.status || 'todo',
          assigned_to: taskForm.assigned_to && taskForm.assigned_to.trim() ? taskForm.assigned_to.trim() : undefined,
          estimated_hours: taskForm.estimated_hours && taskForm.estimated_hours.trim() ? parseInt(taskForm.estimated_hours) : undefined,
          due_date: taskForm.due_date && taskForm.due_date.trim() ? 
            new Date(taskForm.due_date).toISOString() : undefined
        };

        const response = await taskService.updateTask(projectId, editingTask.id, taskData);
        
        // Update the task in local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === editingTask.id ? { ...task, ...response.data.task } : task
          )
        );
        
        console.log('✅ Task updated successfully - closing modal');
        
        // Force close modal and reset everything
        setShowCreateModal(false);
        setEditingTask(null);
        resetForm();
        setError(null);
      } else {
        // Create new task - call the existing createTask function
        await createTask();
      }
    } catch (error) {
      console.error('💥 Save task error:', error);
      setError(error.response?.data?.message || 'Failed to save task');
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

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getMemberName = (userId) => {
    if (!userId) return 'Unassigned';
    const member = projectMembers.find(m => m.user_id === userId);
    return member ? member.full_name : 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': '#6c757d',
      'in_progress': '#007bff',
      'in_review': '#ffc107',
      'completed': '#28a745',
      'blocked': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusTextColor = (status) => {
    return ['in_review'].includes(status) ? '#000' : '#fff';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#fd7e14',
      'urgent': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

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
    viewButton: {
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
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
      minHeight: '100px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
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
      justifyContent: 'flex-end'
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <h2>Loading tasks...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Project Tasks</h1>
          <p style={styles.subtitle}>
            {project ? `${project.title} - Task Management` : 'Manage and track project tasks'}
          </p>
        </div>
        <div style={styles.headerRight}>
          {canCreateTasks && (
            <button
              style={styles.createButton}
              onClick={() => {
                setEditingTask(null);
                resetForm();
                setShowCreateModal(true);
              }}
            >
              + Create Task
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div>
          <label htmlFor="filter-select" style={{ marginRight: '8px', fontWeight: '500' }}>
            Filter:
          </label>
          <select
            id="filter-select"
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
        </div>

        <div style={styles.sortControls}>
          <label htmlFor="sort-by" style={{ marginRight: '8px', fontWeight: '500' }}>
            Sort by:
          </label>
          <select
            id="sort-by"
            style={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Created Date</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
          
          <button
            style={styles.actionButton}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↓' : '↑'}
          </button>
        </div>

        <button
          style={styles.actionButton}
          onClick={fetchTasks}
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div style={styles.emptyState}>
          <h2>No tasks found</h2>
          <p>
            {filter === 'all' 
              ? 'No tasks have been created yet.' 
              : `No tasks match the current filter: ${filter.replace('_', ' ')}`
            }
          </p>
          {canCreateTasks && filter === 'all' && (
            <button
              style={styles.createButton}
              onClick={() => {
                setEditingTask(null);
                resetForm();
                setShowCreateModal(true);
              }}
            >
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div style={styles.tasksGrid}>
          {filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                style={styles.taskCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={styles.taskHeader}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                </div>

                <div style={styles.taskMeta}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(task.status),
                      color: getStatusTextColor(task.status)
                    }}
                  >
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white'
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
                  
                  <div style={styles.taskActions}>
                    {/* View Details button - always visible */}
                    <button
                      style={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewTaskDetail(task.id);
                      }}
                    >
                      View Details
                    </button>
                    
                    {canCreateTasks && (
                      <>
                        <button
                          style={styles.taskButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            editTask(task);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
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

            <form onSubmit={handleSaveTask}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={taskForm.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Enter task description"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="task_type">
                  Task Type
                </label>
                <select
                  id="task_type"
                  name="task_type"
                  value={taskForm.task_type}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                  <option value="testing">Testing</option>
                  <option value="documentation">Documentation</option>
                  <option value="research">Research</option>
                  <option value="planning">Planning</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="priority">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={taskForm.status}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="assigned_to">
                  Assigned To
                </label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={taskForm.assigned_to}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="">Select assignee</option>
                  {projectMembers.map(member => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="estimated_hours">
                  Estimated Hours
                </label>
                <input
                  id="estimated_hours"
                  type="number"
                  name="estimated_hours"
                  value={taskForm.estimated_hours}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="due_date">
                  Due Date
                </label>
                <input
                  id="due_date"
                  type="date"
                  name="due_date"
                  value={taskForm.due_date}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={!taskForm.title.trim()}
                >
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