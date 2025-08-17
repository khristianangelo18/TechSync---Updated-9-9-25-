// backend/routes/challenges.js
// Enhanced routes with alert system support

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import controllers
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage,
  getUserAttempts,
  getUserStats,
  getAttemptDetails
} = require('../controllers/challengeController');

// Import enhanced project recruitment controller with alert system
const {
  getProjectChallenge,
  canAttemptChallenge,
  submitChallengeAttempt,
  getFailedAttemptsCount,
  generateComfortingMessage
} = require('../controllers/projectRecruitmentController');

const { authMiddleware } = require('../middleware/auth');

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

// Enhanced validation for project challenge routes
const projectChallengeValidation = [
  param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID')
];

const submitAttemptValidation = [
  param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  
  body('submittedCode')
    .isString()
    .isLength({ min: 10, max: 50000 })
    .withMessage('Submitted code must be between 10 and 50000 characters'),
  
  body('startedAt')
    .optional()
    .isISO8601()
    .withMessage('Started at must be a valid ISO 8601 date'),
  
  body('challengeId')
    .optional()
    .isUUID()
    .withMessage('Challenge ID must be a valid UUID')
];

// Basic challenge validation
const challengeValidation = [
  body('title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  
  body('difficulty_level')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  body('programming_language')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Programming language must be between 1 and 50 characters'),
  
  body('time_limit_minutes')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Time limit must be between 1 and 480 minutes'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  
  body('test_cases')
    .optional(),
  
  body('starter_code')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Starter code must not exceed 10000 characters'),
  
  body('expected_solution')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Expected solution must not exceed 50000 characters')
];

// Debug middleware for development
const debugMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.params && Object.keys(req.params).length > 0) {
      console.log('Params:', JSON.stringify(req.params, null, 2));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('Query:', JSON.stringify(req.query, null, 2));
    }
  }
  next();
};

// Apply debug middleware to all routes
router.use(debugMiddleware);

// ============== CRITICAL: SPECIFIC ROUTES MUST COME FIRST ==============

// PROJECT RECRUITMENT ROUTES (MUST BE BEFORE GENERIC ROUTES)

// Get coding challenge for a specific project (for joining)
router.get('/project/:projectId/challenge', 
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  getProjectChallenge
);

// Check if user can attempt a project challenge (Enhanced with alert system)
router.get('/project/:projectId/can-attempt',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  canAttemptChallenge
);

// Submit coding challenge attempt for project recruitment (Enhanced with alert system)
router.post('/project/:projectId/attempt',
  authMiddleware,
  submitAttemptValidation,
  handleValidationErrors,
  submitChallengeAttempt
);

// NEW: Get user's failed attempts count for a specific project (for debugging/analytics)
router.get('/project/:projectId/failed-attempts-count',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const failedCount = await getFailedAttemptsCount(userId, projectId);
      const comfortingMessage = failedCount >= 7 ? 
        generateComfortingMessage(failedCount, 'this project') : null;

      res.json({
        success: true,
        data: {
          failedAttemptsCount: failedCount,
          shouldShowAlert: failedCount >= 7,
          comfortingMessage
        }
      });
    } catch (error) {
      console.error('Error getting failed attempts count:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// USER-SPECIFIC ROUTES

// Get user's challenge attempts with pagination
router.get('/attempts',
  authMiddleware,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  getUserAttempts
);

// Get user's challenge statistics
router.get('/stats',
  authMiddleware,
  getUserStats
);

// Get detailed information about a specific attempt
router.get('/attempts/:attemptId',
  authMiddleware,
  [
    param('attemptId')
      .isUUID()
      .withMessage('Attempt ID must be a valid UUID')
  ],
  handleValidationErrors,
  getAttemptDetails
);

// ADMIN/GENERIC CHALLENGE ROUTES

// Get challenges by programming language
router.get('/language/:language',
  authMiddleware,
  [
    param('language')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Language must be between 1 and 50 characters')
  ],
  handleValidationErrors,
  getChallengesByLanguage
);

// Get challenge by ID
router.get('/:id',
  authMiddleware,
  [
    param('id')
      .isUUID()
      .withMessage('Challenge ID must be a valid UUID')
  ],
  handleValidationErrors,
  getChallengeById
);

// Create new challenge
router.post('/',
  authMiddleware,
  challengeValidation,
  handleValidationErrors,
  createChallenge
);

// Update challenge
router.put('/:id',
  authMiddleware,
  [
    param('id')
      .isUUID()
      .withMessage('Challenge ID must be a valid UUID'),
    ...challengeValidation
  ],
  handleValidationErrors,
  updateChallenge
);

// Delete challenge
router.delete('/:id',
  authMiddleware,
  [
    param('id')
      .isUUID()
      .withMessage('Challenge ID must be a valid UUID')
  ],
  handleValidationErrors,
  deleteChallenge
);

// Get all challenges (must be last to avoid conflicts)
router.get('/',
  authMiddleware,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    
    query('language')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Language must be between 1 and 50 characters')
  ],
  handleValidationErrors,
  getChallenges
);

module.exports = router;