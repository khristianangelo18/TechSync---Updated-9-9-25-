// frontend/src/pages/project/ProjectTasks.js - ALIGNED WITH DASHBOARD THEME
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';

// Background symbols component - SAME AS DASHBOARD
const BackgroundSymbols = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    pointerEvents: 'none'
  }}>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
    }}>&#60;/&#62;</div>
  </div>
);

function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectOwner, setProjectOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSuccess, setShowSuccess] = useState(null);

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

  // Fetch project details and members - FIXED
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await projectService.getProjectById(projectId);
        setProject(projectResponse.data.project);
        
        // Fetch members with improved structure handling
        try {
          const membersResponse = await projectService.getProjectMembers(projectId);
          console.log('📋 Members response:', membersResponse.data);
          
          // Extract owner and members from the response
          const { owner, members } = membersResponse.data;
          
          setProjectOwner(owner);
          setProjectMembers(members || []);
          
          console.log('✅ Project owner:', owner?.full_name || owner?.username);
          console.log('✅ Project members:', members?.length || 0);
        } catch (memberError) {
          console.log('Could not fetch project members:', memberError);
          setProjectMembers([]);
          setProjectOwner(null);
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

  // Success message helper
  const showSuccessMessage = (message) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(null), 3000);
  };

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
      showSuccessMessage('Task created successfully');
    } catch (error) {
      console.error('💥 Create task error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create task';
      setError(errorMessage);
    }
  };

  // Edit existing task - IMPROVED VERSION
  const editTask = (task) => {
    console.log('✏️ Starting edit for task:', task);
    
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      task_type: task.task_type || 'development',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours || '',
      due_date: task.due_date ? 
        new Date(task.due_date).toISOString().split('T')[0] : ''
    });
    setError(null); // Clear any previous errors
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
      showSuccessMessage('Task deleted successfully');
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

  // Handle form submission (create or update) - IMPROVED ERROR HANDLING
  const handleSaveTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      if (editingTask) {
        // Update existing task
        console.log('🔄 Updating task:', editingTask.id);
        console.log('🔄 Form data:', taskForm);
        
        // Prepare task data with proper validation - only send changed fields
        const taskData = {};
        
        // Always include title if it's changed
        if (taskForm.title.trim() !== editingTask.title) {
          taskData.title = taskForm.title.trim();
        }
        
        // Include description if changed (can be empty/null)
        if (taskForm.description !== editingTask.description) {
          taskData.description = taskForm.description.trim() || null;
        }
        
        // Include task type if changed
        if (taskForm.task_type !== editingTask.task_type) {
          taskData.task_type = taskForm.task_type || 'development';
        }
        
        // Include priority if changed
        if (taskForm.priority !== editingTask.priority) {
          taskData.priority = taskForm.priority || 'medium';
        }
        
        // Include status if changed
        if (taskForm.status !== editingTask.status) {
          taskData.status = taskForm.status || 'todo';
        }
        
        // Handle assignment changes
        const currentAssignedTo = editingTask.assigned_to || '';
        const newAssignedTo = taskForm.assigned_to?.trim() || '';
        if (currentAssignedTo !== newAssignedTo) {
          taskData.assigned_to = newAssignedTo || null;
        }
        
        // Handle estimated hours changes
        const currentEstimatedHours = editingTask.estimated_hours || '';
        const newEstimatedHours = taskForm.estimated_hours?.toString().trim() || '';
        if (currentEstimatedHours.toString() !== newEstimatedHours) {
          taskData.estimated_hours = newEstimatedHours ? parseInt(newEstimatedHours) : null;
        }
        
        // Handle due date changes
        const currentDueDate = editingTask.due_date ? 
          new Date(editingTask.due_date).toISOString().split('T')[0] : '';
        const newDueDate = taskForm.due_date?.trim() || '';
        if (currentDueDate !== newDueDate) {
          taskData.due_date = newDueDate ? new Date(newDueDate).toISOString() : null;
        }
        
        console.log('📄 Sending update data:', taskData);
        
        // Only proceed if we have changes to make
        if (Object.keys(taskData).length === 0) {
          console.log('ℹ️ No changes detected, closing modal');
          setShowCreateModal(false);
          setEditingTask(null);
          resetForm();
          return;
        }
        
        const response = await taskService.updateTask(projectId, editingTask.id, taskData);
        
        if (response.success && response.data?.task) {
          // Update the task in local state
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === editingTask.id ? { ...task, ...response.data.task } : task
            )
          );
          
          console.log('✅ Task updated successfully');
          showSuccessMessage('Task updated successfully');
          
          // Close modal and reset form
          setShowCreateModal(false);
          setEditingTask(null);
          resetForm();
        } else {
          throw new Error(response.message || 'Update failed - no task data returned');
        }
        
      } else {
        // Create new task - call the existing createTask function
        await createTask();
      }
      
    } catch (error) {
      console.error('💥 Save task error:', error);
      
      // Set user-friendly error message
      let errorMessage = 'Failed to save task';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (error.response.data?.errors) {
          // Validation errors
          const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
          errorMessage = `Validation failed: ${validationErrors}`;
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this task';
      } else if (error.response?.status === 404) {
        errorMessage = 'Task or project not found';
      }
      
      setError(errorMessage);
      
      // Don't close modal on error so user can fix issues
      console.log('⌛ Keeping modal open due to error');
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

  // Helper functions - FIXED member name lookup
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getMemberName = (userId) => {
    if (!userId) return 'Unassigned';
    
    // Check if it's the project owner
    if (projectOwner && projectOwner.id === userId) {
      return `${projectOwner.full_name || projectOwner.username} (Owner)`;
    }
    
    // Check if it's a project member
    const member = projectMembers.find(m => m.users?.id === userId);
    if (member && member.users) {
      return member.users.full_name || member.users.username;
    }
    
    return 'Unknown';
  };

  // Get all assignable members (owner + members) - FIXED
  const getAllAssignableMembers = () => {
    const assignableMembers = [];
    
    // Add project owner
    if (projectOwner) {
      assignableMembers.push({
        id: projectOwner.id,
        name: projectOwner.full_name || projectOwner.username,
        role: 'Owner',
        email: projectOwner.email
      });
    }
    
    // Add project members
    projectMembers.forEach(member => {
      if (member.users) {
        assignableMembers.push({
          id: member.users.id,
          name: member.users.full_name || member.users.username,
          role: member.role,
          email: member.users.email
        });
      }
    });
    
    return assignableMembers;
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': '#6c757d',
      'in_progress': '#3b82f6',
      'in_review': '#f59e0b',
      'completed': '#10b981',
      'blocked': '#ef4444'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusTextColor = (status) => {
    return ['in_review'].includes(status) ? '#000' : '#fff';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#f97316',
      'urgent': '#ef4444'
    };
    return colors[priority] || '#6c757d';
  };

  // Success message component
  const renderSuccessMessage = () => {
    if (!showSuccess) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '12px 24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
        color: 'white',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✓</span>
          <span>{showSuccess}</span>
        </div>
      </div>
    );
  };

  // Error message component
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.1))',
        color: '#fca5a5',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ef4444', fontSize: '16px' }}>⚠</span>
          <span>{error}</span>
        </div>
      </div>
    );
  };

  // Aligned component styles with dashboard theme
  const styles = {
    container: {
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px', // Match Dashboard.js sidebar spacing
      marginLeft: '-150px'   // Match Dashboard.js sidebar spacing
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerLeft: {
      flex: 1
    },
    headerRight: {
      display: 'flex',
      gap: '12px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#d1d5db',
      fontSize: '16px',
      margin: 0
    },
    createButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
    },
    controls: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterLabel: {
      color: '#d1d5db',
      fontSize: '14px',
      fontWeight: '500'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none'
    },
    sortControls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    actionButton: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    refreshButton: {
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    tasksGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      marginBottom: '30px'
    },
    taskCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    taskHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    taskTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 8px 0',
      flex: 1,
      lineHeight: '1.4'
    },
    taskMeta: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexWrap: 'wrap'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    priorityBadge: {
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'white'
    },
    taskDescription: {
      color: '#d1d5db',
      fontSize: '14px',
      marginBottom: '16px',
      lineHeight: '1.5',
      opacity: 0.8
    },
    taskFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    taskInfo: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    taskActions: {
      display: 'flex',
      gap: '8px'
    },
    viewButton: {
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    editButton: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    deleteButton: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '12px'
    },
    emptyText: {
      color: '#9ca3af',
      fontSize: '16px',
      marginBottom: '24px'
    },
    loadingState: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px',
      color: '#9ca3af',
      fontSize: '18px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)'
    },
    modalContent: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.98), rgba(15, 17, 22, 0.95))',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '32px',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    modalHeader: {
      marginBottom: '24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '16px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      color: 'white'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#d1d5db',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none',
      resize: 'vertical',
      transition: 'border-color 0.3s ease'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    saveButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    cancelButton: {
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    memberNote: {
      color: '#9ca3af',
      fontSize: '12px',
      marginTop: '4px',
      fontStyle: 'italic'
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.loadingState}>
          Loading tasks...
        </div>
      </div>
    );
  }

  // Get assignable members for the dropdown
  const assignableMembers = getAllAssignableMembers();

  return (
    <div style={styles.container}>
      {/* Background Code Symbols */}
      <BackgroundSymbols />

      {/* Success Message */}
      {renderSuccessMessage()}

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
                setError(null);
                setShowCreateModal(true);
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
              }}
            >
              + Create Task
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter:</label>
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
        </div>

        <div style={styles.sortControls}>
          <label style={styles.filterLabel}>Sort by:</label>
          <select
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
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {sortOrder === 'asc' ? '↓' : '↑'}
          </button>
        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchTasks}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {renderErrorMessage()}

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>No tasks found</h2>
          <p style={styles.emptyText}>
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
                setError(null);
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
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
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
                    {task.status.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(task.priority)
                    }}
                  >
                    {task.priority}
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
                  <div style={styles.taskInfo}>
                    <div>Due: {formatDate(task.due_date)}</div>
                    <div>Assigned: {getMemberName(task.assigned_to)}</div>
                  </div>
                  
                  <div style={styles.taskActions}>
                    <button
                      style={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewTaskDetail(task.id);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      View
                    </button>
                    
                    {canCreateTasks && (
                      <>
                        <button
                          style={styles.editButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            editTask(task);
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
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
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
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
        <div style={styles.modal} onClick={() => {
          setShowCreateModal(false);
          setEditingTask(null);
          resetForm();
          setError(null);
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>

            {/* Error Message in Modal */}
            {renderErrorMessage()}

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
                  <option value="meeting">Meeting</option>
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
                  <option value="">Unassigned</option>
                  {assignableMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.role !== 'member' ? `(${member.role})` : ''}
                    </option>
                  ))}
                </select>
                {assignableMembers.length === 0 && (
                  <small style={styles.memberNote}>
                    No members found. Only project owner and members can be assigned tasks.
                  </small>
                )}
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
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={!taskForm.title.trim()}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
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