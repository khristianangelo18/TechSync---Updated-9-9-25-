// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import controllers - FIXED IMPORTS
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

// Import project recruitment specific controllers
const {
  getProjectChallenge,
  canAttemptChallenge,
  submitChallengeAttempt
} = require('../controllers/projectRecruitmentController');

// Import middleware
const authMiddleware = require('../middleware/auth');

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const getChallengesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  query('programming_language_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  query('created_by')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      return value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    })
    .withMessage('Created by must be a valid UUID'),
  
  query('project_id')
    .optional()
    .custom((value) => {
      if (value === '' || value === 'null') return true;
      return value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    })
    .withMessage('Project ID must be a valid UUID or "null"'),
  
  query('search')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      return value.length >= 1 && value.length <= 100;
    })
    .withMessage('Search term must be between 1 and 100 characters')
];

const challengeIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Challenge ID must be a valid UUID')
];

const languageIdValidation = [
  param('languageId')
    .isInt({ min: 1 })
    .withMessage('Language ID must be a positive integer')
];

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
    .isLength({ min: 10, max: 50000 })
    .withMessage('Submitted code must be between 10 and 50000 characters'),
  
  body('startedAt')
    .optional()
    .isISO8601()
    .withMessage('Started at must be a valid ISO date'),
    
  body('challengeId')
    .optional()
    .custom(() => true) // Always pass - challengeId is optional for temporary challenges
];

const attemptIdValidation = [
  param('attemptId')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID')
];

const createChallengeValidation = [
  body('title')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  
  body('description')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Description must be between 20 and 10000 characters'),
  
  body('difficulty_level')
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  body('programming_language_id')
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  body('time_limit_minutes')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Time limit must be between 1 and 480 minutes'),
  
  body('project_id')
    .optional()
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  
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

const updateChallengeValidation = [
  param('id')
    .isUUID()
    .withMessage('Challenge ID must be a valid UUID'),
  
  body('title')
    .optional()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 20, max: 10000 })
    .withMessage('Description must be between 20 and 10000 characters'),
  
  body('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  body('programming_language_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
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

// Check if user can attempt a project challenge
router.get('/project/:projectId/can-attempt',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  canAttemptChallenge
);

// Submit coding challenge attempt for project recruitment
router.post('/project/:projectId/attempt',
  authMiddleware,
  submitAttemptValidation,
  handleValidationErrors,
  submitChallengeAttempt
);

// USER-SPECIFIC ROUTES

// Get user's challenge attempts with pagination
router.get('/user/attempts',
  authMiddleware,
  getUserAttempts
);

// Get user's challenge statistics
router.get('/user/stats',
  authMiddleware,
  getUserStats
);

// Get detailed information about a specific attempt
router.get('/attempt/:attemptId',
  authMiddleware,
  attemptIdValidation,
  handleValidationErrors,
  getAttemptDetails
);

// LANGUAGE-SPECIFIC ROUTES

// Get challenges by language
router.get('/language/:languageId', 
  languageIdValidation, 
  handleValidationErrors, 
  getChallengesByLanguage
);

// ============== GENERAL ROUTES (MUST COME AFTER SPECIFIC ROUTES) ==============

// PUBLIC ROUTES (no authentication required)

// GET /api/challenges - Get all challenges with filtering
router.get('/', 
  getChallengesValidation, 
  handleValidationErrors, 
  getChallenges
);

// Get challenge by ID (MUST BE LAST AMONG GET ROUTES)
router.get('/:id', 
  challengeIdValidation, 
  handleValidationErrors, 
  getChallengeById
);

// ============== PROTECTED ROUTES (require authentication) ==============

// Apply authentication to routes below this point
router.use(authMiddleware);

// POST /api/challenges - Create new challenge
router.post('/', 
  createChallengeValidation, 
  handleValidationErrors, 
  createChallenge
);

// PUT /api/challenges/:id - Update challenge
router.put('/:id', 
  updateChallengeValidation, 
  handleValidationErrors, 
  updateChallenge
);

// DELETE /api/challenges/:id - Delete challenge
router.delete('/:id', 
  challengeIdValidation, 
  handleValidationErrors, 
  deleteChallenge
);

// Error handling middleware (should be last)
router.use((err, req, res, next) => {
  console.error('Challenge routes error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;