// backend/routes/skillMatching.js - Enhanced feedback tracking
const express = require('express');
const router = express.Router();
const SkillMatchingService = require('../services/SkillMatchingService');
const AnalyticsService = require('../services/analyticsService');

// Enhanced POST /api/skill-matching/feedback - Real feedback tracking
router.post('/feedback', async (req, res) => {
    try {
        const { recommendation_id, action_taken, feedback_score } = req.body;
        
        console.log('Received feedback:', { recommendation_id, action_taken, feedback_score });
        
        // Store feedback in recommendation_feedback table
        const { data: feedbackData, error: feedbackError } = await supabase
            .from('recommendation_feedback')
            .insert({
                recommendation_id,
                action_taken,
                feedback_score,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (feedbackError) {
            console.error('Error storing feedback:', feedbackError);
            // Don't fail the request, just log the error
        }

        // Update the original recommendation record with action timestamps
        const updateData = {};
        const currentTime = new Date().toISOString();
        
        switch (action_taken) {
            case 'viewed':
                updateData.viewed_at = currentTime;
                break;
            case 'applied':
                updateData.applied_at = currentTime;
                break;
            case 'joined':
                updateData.applied_at = updateData.applied_at || currentTime;
                // Also check if user actually joined the project
                await this.trackProjectJoin(recommendation_id);
                break;
            case 'ignored':
                // Mark as ignored (no specific timestamp field needed)
                break;
        }

        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from('project_recommendations')
                .update(updateData)
                .eq('id', recommendation_id);

            if (updateError) {
                console.error('Error updating recommendation timestamps:', updateError);
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Feedback recorded successfully',
            data: {
                recommendation_id,
                action_taken,
                feedback_score,
                recorded_at: new Date().toISOString(),
                feedback_id: feedbackData?.id
            }
        });
    } catch (error) {
        console.error('Error in feedback endpoint:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// New endpoint to track project applications/joins
router.post('/track-application', async (req, res) => {
    try {
        const { userId, projectId, recommendationId, applicationStatus } = req.body;
        
        // Update recommendation record
        const updateData = {
            applied_at: new Date().toISOString()
        };

        if (applicationStatus === 'joined') {
            // User successfully joined project
            await supabase
                .from('recommendation_feedback')
                .insert({
                    recommendation_id: recommendationId,
                    action_taken: 'joined',
                    created_at: new Date().toISOString()
                });
        }

        const { error } = await supabase
            .from('project_recommendations')
            .update(updateData)
            .eq('id', recommendationId);

        if (error) {
            console.error('Error tracking application:', error);
        }

        res.json({
            success: true,
            message: 'Application tracked successfully'
        });

    } catch (error) {
        console.error('Error tracking application:', error);
        res.status(500).json({ error: error.message });
    }
});

// Enhanced challenge assessment tracking
router.post('/assess', async (req, res) => {
    try {
        const { userId, projectId, challengeId, submittedCode } = req.body;
        
        // Get the original recommendation for this user/project
        const { data: recommendation } = await supabase
            .from('project_recommendations')
            .select('id, recommendation_score')
            .eq('user_id', userId)
            .eq('project_id', projectId)
            .order('recommended_at', { ascending: false })
            .limit(1)
            .single();

        // Assess the coding skill
        const result = await SkillMatchingService.assessCodingSkill(
            userId, projectId, submittedCode, challengeId
        );

        // Store the attempt with enhanced tracking
        const { error: attemptError } = await supabase
            .from('challenge_attempts')
            .insert({
                user_id: userId,
                project_id: projectId,
                challenge_id: challengeId,
                submitted_code: submittedCode,
                score: result.score,
                status: result.passed ? 'passed' : 'failed',
                test_cases_passed: result.testCasesPassed || 0,
                total_test_cases: result.totalTestCases || 0,
                code_quality_score: result.codeQualityScore || 0,
                feedback: result.feedback,
                submitted_at: new Date().toISOString(),
                recommendation_score: recommendation?.recommendation_score || null
            });

        if (attemptError) {
            console.error('Error storing challenge attempt:', attemptError);
        }

        // If user passed and there's a recommendation, update feedback
        if (result.passed && recommendation) {
            await supabase
                .from('recommendation_feedback')
                .insert({
                    recommendation_id: recommendation.id,
                    action_taken: 'applied',
                    feedback_score: result.score >= 90 ? 5 : result.score >= 80 ? 4 : 3,
                    created_at: new Date().toISOString()
                });
        }

        res.json(result);
    } catch (error) {
        console.error('Error in assess endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to track actual project joins
async function trackProjectJoin(recommendationId) {
    try {
        // Get recommendation details
        const { data: recommendation } = await supabase
            .from('project_recommendations')
            .select('user_id, project_id')
            .eq('id', recommendationId)
            .single();

        if (!recommendation) return;

        // Check if user actually joined the project
        const { data: membership } = await supabase
            .from('project_members')
            .select('status, joined_at')
            .eq('user_id', recommendation.user_id)
            .eq('project_id', recommendation.project_id)
            .single();

        if (membership && membership.status === 'active') {
            // User actually joined - this is a true positive
            await supabase
                .from('recommendation_feedback')
                .upsert({
                    recommendation_id: recommendationId,
                    action_taken: 'joined',
                    feedback_score: 5, // Joining is the highest positive feedback
                    created_at: new Date().toISOString()
                });
        }
    } catch (error) {
        console.error('Error tracking project join:', error);
    }
}

module.exports = router;