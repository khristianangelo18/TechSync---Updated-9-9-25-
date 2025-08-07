// frontend/src/services/challengeAPI.js - FIXED
import api from './api';

class ChallengeAPI {
  /**
   * Create a new coding challenge
   * @param {Object} challengeData - Challenge data
   * @returns {Promise} - Created challenge
   */
  static async createChallenge(challengeData) {
    try {
      const response = await api.post('/challenges', challengeData);
      return response.data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get all challenges with filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Array of challenges
   */
  static async getChallenges(filters = {}) {
    try {
      const response = await api.get('/challenges', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Challenge details
   */
  static async getChallengeById(challengeId) {
    try {
      const response = await api.get(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }

  /**
   * Update a challenge
   * @param {string} challengeId - Challenge ID
   * @param {Object} updateData - Updated challenge data
   * @returns {Promise} - Updated challenge
   */
  static async updateChallenge(challengeId, updateData) {
    try {
      const response = await api.put(`/challenges/${challengeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  /**
   * Delete a challenge
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Deletion confirmation
   */
  static async deleteChallenge(challengeId) {
    try {
      const response = await api.delete(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenges by programming language
   * @param {number} languageId - Language ID
   * @param {Object} filters - Additional filters
   * @returns {Promise} - Array of challenges
   */
  static async getChallengesByLanguage(languageId, filters = {}) {
    try {
      const response = await api.get(`/challenges/language/${languageId}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges by language:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge attempts
   * @param {Object} params - Parameters (page, limit, etc.)
   * @returns {Promise} - User's attempts
   */
  static async getUserAttempts(params = {}) {
    try {
      const response = await api.get('/challenges/user/attempts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user attempts:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge statistics
   * @returns {Promise} - User's challenge stats
   */
  static async getUserStats() {
    try {
      const response = await api.get('/challenges/user/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Get attempt details by ID
   * @param {string} attemptId - Attempt ID
   * @returns {Promise} - Attempt details
   */
  static async getAttemptDetails(attemptId) {
    try {
      const response = await api.get(`/challenges/attempt/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attempt details:', error);
      throw error;
    }
  }

  /**
   * Get project challenge for joining
   * @param {string} projectId - Project ID
   * @returns {Promise} - Challenge for project
   */
  static async getProjectChallenge(projectId) {
    try {
      const response = await api.get(`/challenges/project/${projectId}/challenge`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project challenge:', error);
      throw error;
    }
  }

  /**
   * Check if user can attempt a project challenge
   * @param {string} projectId - Project ID
   * @returns {Promise} - Can attempt status
   */
  static async canAttemptChallenge(projectId) {
    try {
      const response = await api.get(`/challenges/project/${projectId}/can-attempt`);
      return response.data;
    } catch (error) {
      console.error('Error checking can attempt:', error);
      throw error;
    }
  }

  /**
   * Submit challenge attempt for project
   * @param {string} projectId - Project ID
   * @param {Object} attemptData - Attempt data
   * @returns {Promise} - Attempt result
   */
  static async submitChallengeAttempt(projectId, attemptData) {
    try {
      const response = await api.post(`/challenges/project/${projectId}/attempt`, attemptData);
      return response.data;
    } catch (error) {
      console.error('Error submitting challenge attempt:', error);
      throw error;
    }
  }

  // FIXED: Add missing getProgrammingLanguages method
  /**
   * Get all programming languages
   * @returns {Promise} - Array of programming languages
   */
  static async getProgrammingLanguages() {
    try {
      const response = await api.get('/onboarding/programming-languages');
      return response.data;
    } catch (error) {
      console.error('Error fetching programming languages:', error);
      throw error;
    }
  }

  /**
   * Get all topics
   * @returns {Promise} - Array of topics
   */
  static async getTopics() {
    try {
      const response = await api.get('/onboarding/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  /**
   * Admin: Get all challenges (admin route)
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Array of challenges for admin
   */
  static async getAdminChallenges(filters = {}) {
    try {
      const response = await api.get('/admin/challenges', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin challenges:', error);
      throw error;
    }
  }
}

export default ChallengeAPI;