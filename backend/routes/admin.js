// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const AnalyticsService = require('../services/analyticsService');
const { DataSeeder } = require('../scripts/seedConfusionMatrixData');
const { ConfusionMatrixTester } = require('../scripts/testConfusionMatrix');

// Import controllers and middleware
const {
  getDashboardStats,
  getUsers,
  updateUser,
  getProjects,
  getChallenges,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireModerator } = require('../middleware/adminAuth');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard (Admin & Moderator)
router.get('/dashboard', requireModerator, getDashboardStats);

// User management (Admin only)
router.get('/users', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('role').optional().isIn(['user', 'admin', 'moderator']),
  query('status').optional().isIn(['active', 'inactive']),
  query('suspended').optional().isIn(['true', 'false'])
], handleValidationErrors, getUsers);

router.put('/users/:userId', requireAdmin, [
  param('userId').isUUID(),
  body('role').optional().isIn(['user', 'admin', 'moderator']),
  body('is_active').optional().isBoolean(),
  body('is_suspended').optional().isBoolean(),
  body('suspension_reason').optional().isLength({ max: 500 }),
  body('suspension_duration').optional().isInt({ min: 1, max: 525600 }) // max 1 year in minutes
], handleValidationErrors, updateUser);

// Project management (Admin & Moderator)
router.get('/projects', requireModerator, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('status').optional().isIn(['recruiting', 'active', 'completed', 'paused', 'cancelled']),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert'])
], handleValidationErrors, getProjects);

// Challenge management (Admin & Moderator)
router.get('/challenges', requireModerator, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']),
  query('language').optional().isInt({ min: 1 }),
  query('is_active').optional().isIn(['true', 'false'])
], handleValidationErrors, getChallenges);

// System settings (Admin only)
router.get('/settings', requireAdmin, getSystemSettings);

router.put('/settings', requireAdmin, [
  body('settings').isObject().withMessage('Settings must be an object')
], handleValidationErrors, updateSystemSettings);

// Activity logs (Admin only)
router.get('/activity-logs', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('admin_id').optional().isUUID(),
  query('action').optional().isLength({ min: 1, max: 100 }),
  query('resource_type').optional().isLength({ min: 1, max: 50 }),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
], handleValidationErrors, getActivityLogs);


// GET /api/admin/analytics/confusion-matrix - Admin view of confusion matrices
router.get('/analytics/confusion-matrix', async (req, res) => {
    try {
        const { type = 'both', timeframe = '30 days' } = req.query;
        
        const result = {};
        
        if (type === 'recommendation' || type === 'both') {
            result.recommendation = await AnalyticsService.generateRecommendationConfusionMatrix(timeframe);
        }
        
        if (type === 'assessment' || type === 'both') {
            result.assessment = await AnalyticsService.generateAssessmentConfusionMatrix(timeframe);
        }
        
        // Add metadata
        result.metadata = {
            timeframe,
            type,
            generated_at: new Date().toISOString(),
            recommendation_total: result.recommendation ? getTotalCount(result.recommendation) : 0,
            assessment_total: result.assessment ? getTotalCount(result.assessment) : 0
        };
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error getting admin confusion matrix:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/admin/analytics/effectiveness - Detailed effectiveness metrics
router.get('/analytics/effectiveness', async (req, res) => {
    try {
        const metrics = await AnalyticsService.calculateEffectivenessMetrics();
        
        // Add additional admin metrics
        const supabase = require('../config/supabase');
        
        // Get data counts
        const { data: recCount } = await supabase
            .from('project_recommendations')
            .select('id', { count: 'exact', head: true });
            
        const { data: feedbackCount } = await supabase
            .from('recommendation_feedback')
            .select('id', { count: 'exact', head: true });
            
        const { data: attemptCount } = await supabase
            .from('challenge_attempts')
            .select('id', { count: 'exact', head: true });
        
        const adminMetrics = {
            ...metrics,
            data_summary: {
                total_recommendations: recCount || 0,
                total_feedback: feedbackCount || 0,
                total_attempts: attemptCount || 0,
                feedback_rate: recCount > 0 ? ((feedbackCount || 0) / recCount * 100).toFixed(2) + '%' : '0%'
            },
            algorithm_health: {
                recommendation_algorithm: metrics.dataQuality?.recommendationDataAvailable ? 'healthy' : 'needs_data',
                assessment_algorithm: metrics.dataQuality?.assessmentDataAvailable ? 'healthy' : 'needs_data',
                overall_status: (metrics.dataQuality?.recommendationDataAvailable && metrics.dataQuality?.assessmentDataAvailable) ? 'operational' : 'limited'
            }
        };
        
        res.json({
            success: true,
            data: adminMetrics
        });
        
    } catch (error) {
        console.error('Error getting admin effectiveness metrics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/admin/analytics/seed-data - Seed sample data for testing
router.post('/analytics/seed-data', async (req, res) => {
    try {
        const { amount = 'standard' } = req.body; // 'minimal', 'standard', 'extensive'
        
        console.log(`🌱 Admin requested data seeding: ${amount}`);
        
        const seeder = new DataSeeder();
        
        // Customize seeding based on amount
        if (amount === 'minimal') {
            seeder.recommendationCount = 25;
            seeder.attemptCount = 20;
        } else if (amount === 'extensive') {
            seeder.recommendationCount = 200;
            seeder.attemptCount = 150;
        } else {
            seeder.recommendationCount = 100;
            seeder.attemptCount = 80;
        }
        
        await seeder.seedConfusionMatrixData();
        
        // Get updated counts
        const supabase = require('../config/supabase');
        const { data: newRecCount } = await supabase
            .from('project_recommendations')
            .select('id', { count: 'exact', head: true });
        const { data: newFeedbackCount } = await supabase
            .from('recommendation_feedback')  
            .select('id', { count: 'exact', head: true });
        const { data: newAttemptCount } = await supabase
            .from('challenge_attempts')
            .select('id', { count: 'exact', head: true });
        
        res.json({
            success: true,
            message: `Sample data seeded successfully (${amount} amount)`,
            data: {
                seeded_recommendations: seeder.recommendationCount || 'unknown',
                seeded_attempts: seeder.attemptCount || 'unknown',
                total_recommendations: newRecCount || 0,
                total_feedback: newFeedbackCount || 0,
                total_attempts: newAttemptCount || 0,
                seeded_at: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error seeding data:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to seed sample data'
        });
    }
});

// POST /api/admin/analytics/test-matrices - Run confusion matrix tests
router.post('/analytics/test-matrices', async (req, res) => {
    try {
        console.log('🧪 Admin requested confusion matrix testing');
        
        const tester = new ConfusionMatrixTester();
        
        // Capture test output
        let testOutput = '';
        const originalLog = console.log;
        console.log = (...args) => {
            testOutput += args.join(' ') + '\n';
            originalLog(...args);
        };
        
        await tester.runAllTests();
        
        // Restore console.log
        console.log = originalLog;
        
        res.json({
            success: true,
            message: 'Confusion matrix tests completed',
            data: {
                test_results: tester.testResults,
                test_output: testOutput,
                tested_at: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error running tests:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to run confusion matrix tests'
        });
    }
});

// GET /api/admin/analytics/data-status - Check current data status
router.get('/analytics/data-status', async (req, res) => {
    try {
        const supabase = require('../config/supabase');
        
        // Get comprehensive data status
        const [
            { data: recommendations, count: recCount },
            { data: feedback, count: feedbackCount },
            { data: attempts, count: attemptCount },
            { data: users, count: userCount },
            { data: projects, count: projectCount }
        ] = await Promise.all([
            supabase.from('project_recommendations').select('*', { count: 'exact' }).limit(5),
            supabase.from('recommendation_feedback').select('*', { count: 'exact' }).limit(5),
            supabase.from('challenge_attempts').select('*', { count: 'exact' }).limit(5),
            supabase.from('users').select('id', { count: 'exact' }).limit(1),
            supabase.from('projects').select('id', { count: 'exact' }).limit(1)
        ]);
        
        // Check for recent data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: recentRecs } = await supabase
            .from('project_recommendations')
            .select('id', { count: 'exact', head: true })
            .gte('recommended_at', thirtyDaysAgo.toISOString());
            
        const { data: recentAttempts } = await supabase
            .from('challenge_attempts')
            .select('id', { count: 'exact', head: true })
            .gte('submitted_at', thirtyDaysAgo.toISOString());
        
        const dataStatus = {
            overview: {
                total_users: userCount || 0,
                total_projects: projectCount || 0,
                total_recommendations: recCount || 0,
                total_feedback: feedbackCount || 0,
                total_attempts: attemptCount || 0
            },
            recent_activity: {
                recommendations_last_30_days: recentRecs || 0,
                attempts_last_30_days: recentAttempts || 0
            },
            data_quality: {
                has_recommendations: (recCount || 0) > 0,
                has_feedback: (feedbackCount || 0) > 0,
                has_attempts: (attemptCount || 0) > 0,
                feedback_coverage: recCount > 0 ? ((feedbackCount / recCount) * 100).toFixed(1) + '%' : '0%',
                ready_for_matrix: (recCount || 0) > 10 && (feedbackCount || 0) > 5 && (attemptCount || 0) > 5
            },
            sample_data: {
                latest_recommendation: recommendations?.[0] || null,
                latest_feedback: feedback?.[0] || null,
                latest_attempt: attempts?.[0] || null
            },
            recommendations: {
                seed_data: (recCount || 0) < 10 ? 'Consider seeding sample data for testing' : null,
                test_matrices: 'Run matrix tests to validate algorithm performance',
                monitor_performance: 'Regular monitoring recommended for production use'
            }
        };
        
        res.json({
            success: true,
            data: dataStatus,
            checked_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error checking data status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/admin/analytics/clear-data - Clear test data (careful!)
router.delete('/analytics/clear-data', async (req, res) => {
    try {
        const { confirm, tables } = req.body;
        
        if (confirm !== 'YES_CLEAR_ALL_DATA') {
            return res.status(400).json({
                success: false,
                error: 'Confirmation required. Send { "confirm": "YES_CLEAR_ALL_DATA" }'
            });
        }
        
        const supabase = require('../config/supabase');
        const tablesToClear = tables || ['recommendation_feedback', 'project_recommendations', 'challenge_attempts'];
        
        const results = {};
        
        for (const table of tablesToClear) {
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible UUID
                
            results[table] = error ? `Error: ${error.message}` : 'Cleared successfully';
        }
        
        res.json({
            success: true,
            message: 'Data clearing completed',
            data: {
                cleared_tables: tablesToClear,
                results,
                cleared_at: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function
function getTotalCount(matrix) {
    return Object.values(matrix).reduce((total, row) => 
        total + Object.values(row).reduce((sum, count) => sum + count, 0), 0
    );
}

module.exports = router;