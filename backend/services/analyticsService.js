// services/AnalyticsService.js
class AnalyticsService {
    /**
     * Generate confusion matrix for recommendation effectiveness
     */
    async generateRecommendationConfusionMatrix(timeframe = '30 days') {
        const query = `
            WITH recommendation_outcomes AS (
                SELECT 
                    pr.recommendation_score,
                    CASE 
                        WHEN rf.action_taken IN ('applied', 'joined') THEN 'positive'
                        WHEN rf.action_taken IN ('viewed') THEN 'neutral'
                        ELSE 'negative'
                    END as actual_outcome,
                    CASE 
                        WHEN pr.recommendation_score >= 80 THEN 'high_confidence'
                        WHEN pr.recommendation_score >= 60 THEN 'medium_confidence'
                        ELSE 'low_confidence'
                    END as predicted_outcome
                FROM project_recommendations pr
                LEFT JOIN recommendation_feedback rf ON pr.id = rf.recommendation_id
                WHERE pr.recommended_at >= NOW() - INTERVAL '${timeframe}'
            )
            SELECT 
                predicted_outcome,
                actual_outcome,
                COUNT(*) as count
            FROM recommendation_outcomes
            GROUP BY predicted_outcome, actual_outcome
            ORDER BY predicted_outcome, actual_outcome
        `;
        
        const result = await db.query(query);
        return this.formatConfusionMatrix(result.rows);
    }

    /**
     * Generate confusion matrix for coding assessment
     */
    async generateAssessmentConfusionMatrix(timeframe = '30 days') {
        const query = `
            WITH assessment_outcomes AS (
                SELECT 
                    ca.score,
                    ca.status,
                    pm.status as actual_performance,
                    CASE 
                        WHEN ca.score >= 80 THEN 'predicted_success'
                        WHEN ca.score >= 60 THEN 'predicted_moderate'
                        ELSE 'predicted_failure'
                    END as predicted_outcome,
                    CASE 
                        WHEN pm.contribution_score > 70 THEN 'actual_success'
                        WHEN pm.contribution_score > 40 THEN 'actual_moderate'
                        ELSE 'actual_failure'
                    END as actual_outcome
                FROM challenge_attempts ca
                JOIN project_members pm ON ca.user_id = pm.user_id AND ca.project_id = pm.project_id
                WHERE ca.submitted_at >= NOW() - INTERVAL '${timeframe}'
                AND ca.status = 'passed'
                AND pm.status = 'active'
            )
            SELECT 
                predicted_outcome,
                actual_outcome,
                COUNT(*) as count
            FROM assessment_outcomes
            GROUP BY predicted_outcome, actual_outcome
            ORDER BY predicted_outcome, actual_outcome
        `;
        
        const result = await db.query(query);
        return this.formatConfusionMatrix(result.rows);
    }

    /**
     * Calculate algorithm effectiveness metrics
     */
    async calculateEffectivenessMetrics() {
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
    }

    formatConfusionMatrix(data) {
        const matrix = {};
        data.forEach(row => {
            if (!matrix[row.predicted_outcome]) {
                matrix[row.predicted_outcome] = {};
            }
            matrix[row.predicted_outcome][row.actual_outcome] = parseInt(row.count);
        });
        return matrix;
    }

    calculateAccuracy(matrix) {
        let correct = 0;
        let total = 0;
        
        Object.keys(matrix).forEach(predicted => {
            Object.keys(matrix[predicted]).forEach(actual => {
                const count = matrix[predicted][actual];
                total += count;
                if (predicted === actual) {
                    correct += count;
                }
            });
        });
        
        return total > 0 ? (correct / total) : 0;
    }
}

module.exports = new AnalyticsService();