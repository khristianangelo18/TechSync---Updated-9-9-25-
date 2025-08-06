// frontend/src/services/adminAPI.js
import api from './api';

class AdminAPI {
  /**
   * Get admin dashboard stats
   */
  static async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get users with filtering and pagination
   */
  static async getUsers(filters = {}) {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user status/role
   */
  static async updateUser(userId, updateData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get projects for admin management
   */
  static async getProjects(filters = {}) {
    try {
      const response = await api.get('/admin/projects', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get challenges for admin management
   */
  static async getChallenges(filters = {}) {
    try {
      const response = await api.get('/admin/challenges', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Get system settings
   */
  static async getSystemSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(settings) {
    try {
      const response = await api.put('/admin/settings', { settings });
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  /**
   * Get admin activity logs
   */
  static async getActivityLogs(filters = {}) {
    try {
      const response = await api.get('/admin/activity-logs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Suspend user account
   */
  static async suspendUser(userId, reason, durationMinutes) {
    try {
      const response = await api.put(`/admin/users/${userId}`, {
        is_suspended: true,
        suspension_reason: reason,
        suspension_duration: durationMinutes
      });
      return response.data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  /**
   * Unsuspend user account
   */
  static async unsuspendUser(userId) {
    try {
      const response = await api.put(`/admin/users/${userId}`, {
        is_suspended: false,
        suspension_reason: null
      });
      return response.data;
    } catch (error) {
      console.error('Error unsuspending user:', error);
      throw error;
    }
  }

  /**
   * Change user role
   */
  static async changeUserRole(userId, newRole) {
    try {
      const response = await api.put(`/admin/users/${userId}`, {
        role: newRole
      });
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  }

  /**
   * Activate/Deactivate user account
   */
  static async toggleUserStatus(userId, isActive) {
    try {
      const response = await api.put(`/admin/users/${userId}`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }
}

export default AdminAPI;