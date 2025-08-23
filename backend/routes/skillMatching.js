// backend/routes/skillMatching.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

// Support both default and named export for auth middleware
const authModule = require('../middleware/auth');
const authMiddleware = authModule.authMiddleware || authModule;

// Helpers
const ALLOWED_ACTIONS = new Set(['viewed', 'applied', 'joined', 'ignored']);

function normalizeActionTaken(input) {
  const a = String(input || '').toLowerCase().trim();
  return ALLOWED_ACTIONS.has(a) ? a : 'viewed';
}

function normalizeScore(s) {
  if (s == null) return null;
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(5, Math.max(1, n));
}

// Enhanced recommendations: GET /api/skill-matching/recommendations/:userId/enhanced?limit=10
router.get('/recommendations/:userId/enhanced', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || '10', 10);

    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const recs = await skillMatching.recommendProjects(userId, { limit });
    return res.json({
      success: true,
      data: {
        recommendations: recs,
        meta: {
          total: recs.length,
          algorithm_version: '2.0-enhanced',
          generated_at: new Date().toISOString()
        }
      }
    });
  } catch (e) {
    console.error('Enhanced recs error:', e);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
});

// Legacy recommendations: GET /api/skill-matching/recommendations/:userId
router.get('/recommendations/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || '10', 10);

    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const recs = await skillMatching.recommendProjects(userId, { limit });
    return res.json(recs);
  } catch (e) {
    console.error('Legacy recs error:', e);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
});

// One handler for both feedback endpoints
async function handleFeedback(req, res) {
  try {
    const userId = req.user.id;

    // Accept both payload shapes:
    // 1) { recommendation_id, action_taken, feedback_score, project_id? }
    // 2) { projectId, action, score, reason? }  // "reason" is ignored (no column)
    const {
      recommendation_id,
      action_taken,
      feedback_score,
      project_id
    } = req.body;

    const projectIdLegacy = req.body.projectId;
    const actionLegacy = req.body.action;
    const scoreLegacy = req.body.score;

    const payload = {
      user_id: userId,
      recommendation_id: recommendation_id || null,
      project_id: project_id || projectIdLegacy || null,
      action_taken: normalizeActionTaken(action_taken || actionLegacy || 'viewed'),
      feedback_score: normalizeScore(feedback_score ?? scoreLegacy ?? null)
      // created_at will use DEFAULT now() from DB
    };

    // Only include allowed columns
    const insertRow = {
      user_id: payload.user_id,
      recommendation_id: payload.recommendation_id,
      project_id: payload.project_id,
      action_taken: payload.action_taken,
      feedback_score: payload.feedback_score
    };

    const { error } = await supabase
      .from('recommendation_feedback')
      .insert([insertRow]);

    if (error) {
      // Table missing? Don't break UX.
      if (String(error.code) === '42P01') {
        console.warn('recommendation_feedback table missing; returning success anyway');
        return res.json({ success: true, message: 'Feedback received (not persisted)' });
      }
      console.error('Feedback insert error:', error);
      return res.status(500).json({ success: false, message: 'Failed to store feedback' });
    }

    return res.json({ success: true, message: 'Feedback stored' });
  } catch (e) {
    console.error('Feedback error:', e);
    return res.status(500).json({ success: false, message: 'Failed to store feedback' });
  }
}

// Feedback endpoints
// POST /api/skill-matching/feedback
router.post('/feedback', authMiddleware, handleFeedback);
// POST /api/skill-matching/recommendations/feedback
router.post('/recommendations/feedback', authMiddleware, handleFeedback);

module.exports = router;