// frontend/src/services/taskService.js
import api from './api';

export const taskService = {
  // Get all tasks for a project
  getProjectTasks: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/projects/${projectId}/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get project tasks error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new task
  createTask: async (projectId, taskData) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Create task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific task
  getTask: async (projectId, taskId) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Get task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a task
  updateTask: async (projectId, taskId, updateData) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (projectId, taskId) => {
    try {
      const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Delete task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get task statistics
  getTaskStats: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks/stats`);
      return response.data;
    } catch (error) {
      console.error('Get task stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update task status (quick action)
  updateTaskStatus: async (projectId, taskId, status) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Update task status error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Assign task to user (quick action)
  assignTask: async (projectId, taskId, userId) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, { 
        assigned_to: userId 
      });
      return response.data;
    } catch (error) {
      console.error('Assign task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Unassign task (quick action)
  unassignTask: async (projectId, taskId) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, { 
        assigned_to: null 
      });
      return response.data;
    } catch (error) {
      console.error('Unassign task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update task priority (quick action)
  updateTaskPriority: async (projectId, taskId, priority) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, { priority });
      return response.data;
    } catch (error) {
      console.error('Update task priority error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark task as completed
  completeTask: async (projectId, taskId) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, { 
        status: 'completed' 
      });
      return response.data;
    } catch (error) {
      console.error('Complete task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Start working on task
  startTask: async (projectId, taskId) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, { 
        status: 'in_progress' 
      });
      return response.data;
    } catch (error) {
      console.error('Start task error:', error.response?.data || error.message);
      throw error;
    }
  }
};