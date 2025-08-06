// frontend/src/services/challengeAPI.js
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
   * @param {number} languageId - Programming language ID
   * @param {Object} filters - Additional filters
   * @returns {Promise} - Array of challenges for the language
   */
  static async getChallengesByLanguage(languageId, filters = {}) {
    try {
      const response = await api.get(`/challenges/language/${languageId}`, { 
        params: filters 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges by language:', error);
      throw error;
    }
  }

  /**
   * Get programming languages for dropdown
   * @returns {Promise} - Array of programming languages
   */
  static async getProgrammingLanguages() {
    try {
      const response = await api.get('/suggestions/programming-languages');
      return response.data;
    } catch (error) {
      console.error('Error fetching programming languages:', error);
      throw error;
    }
  }
}

export default ChallengeAPI;