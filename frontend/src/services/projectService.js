import api from './api';

export const projectService = {
  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Project service error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all projects with filters
  getProjects: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/projects?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Get project by ID error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user's projects
  getUserProjects: async (role = 'all') => {
    try {
      const response = await api.get(`/projects/user/my?role=${role}`);
      return response.data;
    } catch (error) {
      console.error('Get user projects error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update project (placeholder for future implementation)
  updateProject: async (projectId, updateData) => {
    try {
      const response = await api.put(`/projects/${projectId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update project error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete project (placeholder for future implementation)
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Delete project error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Join project (placeholder for future implementation)
  joinProject: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/join`);
      return response.data;
    } catch (error) {
      console.error('Join project error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Leave project (placeholder for future implementation)
  leaveProject: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Leave project error:', error.response?.data || error.message);
      throw error;
    }
  }
};