// frontend/src/services/skillMatchingAPI.js
import api from './api';

class SkillMatchingAPI {
  /**
   * Get project recommendations for the current user
   * @param {string} userId - User ID
   * @returns {Promise} - Array of recommended projects
   */
  static async getRecommendations(userId) {
    try {
      const response = await api.get(`/skill-matching/recommendations/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * Submit a coding challenge attempt
   * @param {Object} challengeData - Challenge submission data
   * @param {string} challengeData.userId - User ID
   * @param {string} challengeData.projectId - Project ID
   * @param {string} challengeData.challengeId - Challenge ID
   * @param {string} challengeData.submittedCode - User's code submission
   * @returns {Promise} - Assessment result
   */
  static async submitChallenge(challengeData) {
    try {
      const response = await api.post('/skill-matching/assess', challengeData);
      return response.data;
    } catch (error) {
      console.error('Error submitting challenge:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge attempts for a specific project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @returns {Promise} - Array of challenge attempts
   */
  static async getChallengeAttempts(userId, projectId) {
    try {
      const response = await api.get(`/skill-matching/attempts/${userId}/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge attempts:', error);
      throw error;
    }
  }

  /**
   * Get learning recommendations for a user
   * @param {string} userId - User ID
   * @returns {Promise} - Array of learning recommendations
   */
  static async getLearningRecommendations(userId) {
    try {
      const response = await api.get(`/skill-matching/learning-recommendations/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
      throw error;
    }
  }

  /**
   * Mark a learning recommendation as completed
   * @param {string} recommendationId - Recommendation ID
   * @param {number} effectivenessScore - User's rating (1-5)
   * @returns {Promise} - Updated recommendation
   */
  static async completeLearningRecommendation(recommendationId, effectivenessScore) {
    try {
      const response = await api.put(`/skill-matching/learning-recommendations/${recommendationId}/complete`, {
        effectiveness_score: effectivenessScore
      });
      return response.data;
    } catch (error) {
      console.error('Error completing learning recommendation:', error);
      throw error;
    }
  }

  /**
   * Get confusion matrix analytics
   * @param {string} type - 'recommendation' or 'assessment'
   * @param {string} timeframe - Time period (e.g., '30 days', '90 days')
   * @returns {Promise} - Confusion matrix data
   */
  static async getConfusionMatrix(type = 'recommendation', timeframe = '30 days') {
    try {
      const response = await api.get(`/skill-matching/analytics/confusion-matrix`, {
        params: { type, timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching confusion matrix:', error);
      throw error;
    }
  }

  /**
   * Get algorithm effectiveness metrics
   * @returns {Promise} - Effectiveness metrics including accuracy, precision, recall
   */
  static async getEffectivenessMetrics() {
    try {
      const response = await api.get('/skill-matching/analytics/effectiveness');
      return response.data;
    } catch (error) {
      console.error('Error fetching effectiveness metrics:', error);
      throw error;
    }
  }

  /**
   * Update user's feedback on a recommendation
   * @param {string} recommendationId - Recommendation ID
   * @param {string} action - Action taken ('viewed', 'applied', 'joined', 'ignored')
   * @param {number} feedbackScore - Rating from 1-5
   * @returns {Promise} - Updated feedback
   */
  static async updateRecommendationFeedback(recommendationId, action, feedbackScore = null) {
    try {
      const response = await api.post('/skill-matching/feedback', {
        recommendation_id: recommendationId,
        action_taken: action,
        feedback_score: feedbackScore
      });
      return response.data;
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      throw error;
    }
  }

  /**
   * Get project challenge details
   * @param {string} projectId - Project ID
   * @returns {Promise} - Challenge details for the project
   */
  static async getProjectChallenge(projectId) {
    try {
      const response = await api.get(`/skill-matching/challenges/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project challenge:', error);
      throw error;
    }
  }

  /**
   * Get user's overall skill assessment summary
   * @param {string} userId - User ID
   * @returns {Promise} - Skill assessment summary
   */
  static async getSkillAssessmentSummary(userId) {
    try {
      const response = await api.get(`/skill-matching/assessment-summary/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill assessment summary:', error);
      throw error;
    }
  }

  /**
   * Update algorithm configuration (admin only)
   * @param {Object} config - Algorithm configuration
   * @param {Object} config.weights - Matching weights
   * @param {Object} config.thresholds - Score thresholds
   * @returns {Promise} - Updated configuration
   */
  static async updateAlgorithmConfig(config) {
    try {
      const response = await api.put('/skill-matching/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating algorithm configuration:', error);
      throw error;
    }
  }

  /**
   * Get algorithm configuration (admin only)
   * @returns {Promise} - Current algorithm configuration
   */
  static async getAlgorithmConfig() {
    try {
      const response = await api.get('/skill-matching/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching algorithm configuration:', error);
      throw error;
    }
  }
}

export default SkillMatchingAPI;