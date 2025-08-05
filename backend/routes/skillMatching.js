// routes/skillMatching.js
const express = require('express');
const router = express.Router();
const SkillMatchingService = require('../services/SkillMatchingService');
const AnalyticsService = require('../services/analyticsService');

// Get project recommendations for user
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const recommendations = await SkillMatchingService.recommendProjects(req.params.userId);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit coding challenge attempt
router.post('/assess', async (req, res) => {
    try {
        const { userId, projectId, challengeId, submittedCode } = req.body;
        const result = await SkillMatchingService.assessCodingSkill(
            userId, projectId, submittedCode, challengeId
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get analytics and confusion matrices
router.get('/analytics/confusion-matrix', async (req, res) => {
    try {
        const { type, timeframe } = req.query;
        let matrix;
        
        if (type === 'recommendation') {
            matrix = await AnalyticsService.generateRecommendationConfusionMatrix(timeframe);
        } else {
            matrix = await AnalyticsService.generateAssessmentConfusionMatrix(timeframe);
        }
        
        res.json(matrix);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics/effectiveness', async (req, res) => {
    try {
        const metrics = await AnalyticsService.calculateEffectivenessMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;