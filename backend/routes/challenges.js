// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import your existing controllers
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage
} = require('../controllers/challengeController');

// Import new project recruitment controllers
const {
  getProjectChallenge,
  submitChallengeAttempt,
  getUserAttempts,
  getAttemptDetails,
  getUserStats,
  canAttemptChallenge
} = require('../controllers/projectRecruitmentController');

// Import middleware
const authMiddleware = require('../middleware/auth');

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

// Your existing validation rules
const createChallengeValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('difficulty_level')
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  body('time_limit_minutes')
    .isInt({ min: 5, max: 300 })
    .withMessage('Time limit must be between 5 and 300 minutes'),
  
  body('programming_language_id')
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  body('project_id')
    .optional()
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  
  body('starter_code')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Starter code must be less than 10000 characters'),
  
  body('expected_solution')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Expected solution must be less than 10000 characters'),
  
  body('test_cases')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (error) {
          throw new Error('Test cases must be valid JSON');
        }
      }
      return true;
    })
];

const updateChallengeValidation = [
  param('id')
    .isUUID()
    .withMessage('Challenge ID must be a valid UUID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  body('time_limit_minutes')
    .optional()
    .isInt({ min: 5, max: 300 })
    .withMessage('Time limit must be between 5 and 300 minutes'),
  
  body('programming_language_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  body('starter_code')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Starter code must be less than 10000 characters'),
  
  body('expected_solution')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Expected solution must be less than 10000 characters'),
  
  body('test_cases')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (error) {
          throw new Error('Test cases must be valid JSON');
        }
      }
      return true;
    })
];

const getChallengesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('difficulty_level')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Allow empty string
      return ['easy', 'medium', 'hard', 'expert'].includes(value);
    })
    .withMessage('Invalid difficulty level'),
  
  query('programming_language_id')
    .optional()
    .custom((value) => {
      if (value === '' || value === undefined) return true; // Allow empty string
      return Number.isInteger(parseInt(value)) && parseInt(value) > 0;
    })
    .withMessage('Programming language ID must be a positive integer'),
  
  query('created_by')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Allow empty string
      return value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    })
    .withMessage('Created by must be a valid UUID'),
  
  query('project_id')
    .optional()
    .custom((value) => {
      if (value === '' || value === 'null') return true; // Allow empty string or 'null'
      return value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    })
    .withMessage('Project ID must be a valid UUID or "null"'),
  
  query('search')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Allow empty string
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

// NEW VALIDATION RULES FOR PROJECT RECRUITMENT
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
    .withMessage('Started at must be a valid ISO date')
];

const attemptIdValidation = [
  param('attemptId')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID')
];

// ============== YOUR EXISTING ROUTES ==============

// PUBLIC ROUTES (no authentication required)
router.get('/', getChallengesValidation, handleValidationErrors, getChallenges);
router.get('/:id', challengeIdValidation, handleValidationErrors, getChallengeById);
router.get('/language/:languageId', languageIdValidation, handleValidationErrors, getChallengesByLanguage);

// ============== NEW PROJECT RECRUITMENT ROUTES ==============

// Get coding challenge for a specific project (for joining)
router.get('/project/:projectId/challenge', 
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  getProjectChallenge
);

// Submit coding challenge attempt for project recruitment
router.post('/project/:projectId/attempt',
  authMiddleware,
  submitAttemptValidation,
  handleValidationErrors,
  submitChallengeAttempt
);

// Check if user can attempt a project challenge
router.get('/project/:projectId/can-attempt',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  canAttemptChallenge
);

// Get user's challenge attempts with pagination
router.get('/user/attempts',
  authMiddleware,
  getUserAttempts
);

// Get detailed information about a specific attempt
router.get('/attempt/:attemptId',
  authMiddleware,
  attemptIdValidation,
  handleValidationErrors,
  getAttemptDetails
);

// Get user's challenge statistics
router.get('/user/stats',
  authMiddleware,
  getUserStats
);

// ============== YOUR EXISTING PROTECTED ROUTES ==============
router.use(authMiddleware); // Apply auth to routes below

// POST /api/challenges - Create new challenge
router.post('/', createChallengeValidation, handleValidationErrors, createChallenge);

// PUT /api/challenges/:id - Update challenge
router.put('/:id', updateChallengeValidation, handleValidationErrors, updateChallenge);

// DELETE /api/challenges/:id - Delete challenge
router.delete('/:id', challengeIdValidation, handleValidationErrors, deleteChallenge);

module.exports = router;