// backend/services/analyticsService.js
const supabase = require('../config/supabase');

class AnalyticsService {
    /**
     * Generate confusion matrix for recommendation effectiveness
     */
    async generateRecommendationConfusionMatrix(timeframe = '30 days') {
        try {
            // For now, return mock data
            // You can implement the actual logic later when you have more data
            return {
                high_confidence: {
                    positive: 15,
                    neutral: 5,
                    negative: 2
                },
                medium_confidence: {
                    positive: 10,
                    neutral: 8,
                    negative: 4
                },
                low_confidence: {
                    positive: 3,
                    neutral: 12,
                    negative: 8
                }
            };
        } catch (error) {
            console.error('Error generating recommendation confusion matrix:', error);
            return {};
        }
    }

    /**
     * Generate confusion matrix for coding assessment
     */
    async generateAssessmentConfusionMatrix(timeframe = '30 days') {
        try {
            // For now, return mock data
            return {
                predicted_success: {
                    actual_success: 12,
                    actual_moderate: 3,
                    actual_failure: 1
                },
                predicted_moderate: {
                    actual_success: 5,
                    actual_moderate: 8,
                    actual_failure: 2
                },
                predicted_failure: {
                    actual_success: 1,
                    actual_moderate: 4,
                    actual_failure: 9
                }
            };
        } catch (error) {
            console.error('Error generating assessment confusion matrix:', error);
            return {};
        }
    }

    /**
     * Calculate algorithm effectiveness metrics
     */
    async calculateEffectivenessMetrics() {
        try {
            const recommendationMatrix = await this.generateRecommendationConfusionMatrix();
            const assessmentMatrix = await this.generateAssessmentConfusionMatrix();
            
            return {
                recommendation: {
                    accuracy: this.calculateAccuracy(recommendationMatrix),
                    precision: this.calculatePrecision(recommendationMatrix),
                    recall: this.calculateRecall(recommendationMatrix),
                    f1Score: this.calculateF1Score(recommendationMatrix)
                },
                assessment: {
                    accuracy: this.calculateAccuracy(assessmentMatrix),
                    precision: this.calculatePrecision(assessmentMatrix),
                    recall: this.calculateRecall(assessmentMatrix)
                }
            };
        } catch (error) {
            console.error('Error calculating effectiveness metrics:', error);
            return {
                recommendation: { accuracy: 0, precision: 0, recall: 0, f1Score: 0 },
                assessment: { accuracy: 0, precision: 0, recall: 0 }
            };
        }
    }

    /**
     * Calculate accuracy from confusion matrix
     */
    calculateAccuracy(matrix) {
        let correct = 0;
        let total = 0;
        
        try {
            Object.keys(matrix).forEach(predicted => {
                Object.keys(matrix[predicted]).forEach(actual => {
                    const count = matrix[predicted][actual];
                    total += count;
                    if (predicted === actual || 
                        (predicted.includes('success') && actual.includes('success'))) {
                        correct += count;
                    }
                });
            });
            
            return total > 0 ? Math.round((correct / total) * 100) / 100 : 0;
        } catch (error) {
            console.error('Error calculating accuracy:', error);
            return 0;
        }
    }

    /**
     * Calculate precision from confusion matrix
     */
    calculatePrecision(matrix) {
        try {
            // Simplified precision calculation
            return 0.75; // Mock value
        } catch (error) {
            console.error('Error calculating precision:', error);
            return 0;
        }
    }

    /**
     * Calculate recall from confusion matrix
     */
    calculateRecall(matrix) {
        try {
            // Simplified recall calculation
            return 0.68; // Mock value
        } catch (error) {
            console.error('Error calculating recall:', error);
            return 0;
        }
    }

    /**
     * Calculate F1 score from confusion matrix
     */
    calculateF1Score(matrix) {
        try {
            const precision = this.calculatePrecision(matrix);
            const recall = this.calculateRecall(matrix);
            
            if (precision + recall === 0) return 0;
            return Math.round((2 * precision * recall) / (precision + recall) * 100) / 100;
        } catch (error) {
            console.error('Error calculating F1 score:', error);
            return 0;
        }
    }
}

module.exports = new AnalyticsService();