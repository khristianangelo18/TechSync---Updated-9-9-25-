// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

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

module.exports = router;